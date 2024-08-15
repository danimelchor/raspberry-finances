package rest

import (
	"context"
	db "dmelchorpi/internal/model"
	"dmelchorpi/internal/security"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

type AuthClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func generateToken(user *db.User) (string, error) {
	rsaPrivateKey, err := security.LoadRsa()
	if err != nil {
		return "", err
	}
	claims := AuthClaims{
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(rsaPrivateKey)
}

func login(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Login
	user, err := db.Login(body.Username, body.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		log.Println("Login failed: ", err)
		return
	}

	// Generate token
	token, err := generateToken(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println("Token generation failed: ", err)
		return
	}

	// Respond
	cookie := http.Cookie{
		Name:    "access_token_cookie",
		Value:   token,
		Expires: time.Now().Add(time.Hour * 24),
		Path:    "/",
	}
	http.SetCookie(w, &cookie)
	fmt.Fprint(w, "Ok")
}

func getAuthenticatedUser(r *http.Request) (*db.User, error) {
	cookie, err := r.Cookie("access_token_cookie")
	if err != nil {
		return nil, err
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return security.LoadRsaPub()
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("Invalid token")
	}

	username, ok := claims["username"].(string)
	if !ok {
		return nil, fmt.Errorf("Invalid token")
	}

	user, err := db.GetUser(username)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func whoami(w http.ResponseWriter, r *http.Request) {
	user, err := getAuthenticatedUser(r)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusUnauthorized)
	}

	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
	}
}

func logout(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{
		Name:    "access_token_cookie",
		Value:   "",
		Expires: time.Now().Add(-time.Hour),
		Path:    "/",
	}
	http.SetCookie(w, &cookie)
	fmt.Fprint(w, "Ok")
}

func register(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var body db.User
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Register
	err = db.CreateUser(
		body.Username,
		body.Email,
		body.Password,
	)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate token
	body.Password = ""
	token, err := generateToken(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond
	cookie := http.Cookie{
		Name:    "access_token_cookie",
		Value:   token,
		Expires: time.Now().Add(time.Hour * 24),
		Path:    "/",
	}
	http.SetCookie(w, &cookie)
	fmt.Fprint(w, "Ok")
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, err := getAuthenticatedUser(r)
		if err != nil || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), "username", user.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func ConfigureAuthRoutes(r chi.Router) {
	r.Post("/login", login)
	r.Post("/logout", logout)
	r.Post("/register", register)
	r.Get("/whoami", whoami)
}
