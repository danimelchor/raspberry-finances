package security

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
)

var AUTH_API = os.Getenv("AUTH_URL") + "/whoami"

func getAuthenticatedUser(r *http.Request) (string, error) {
	cookie, err := r.Cookie("access_token_cookie")
	if err != nil {
		return "", err
	}

	// Make a request to the auth API
	req, err := http.NewRequest("GET", AUTH_API, nil)
	if err != nil {
		return "", err
	}
	req.AddCookie(cookie)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	// Parse the response
	var response map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return "", err
	}

	username, ok := response["username"].(string)
	if !ok {
		return "", nil
	}

	return username, nil
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, err := getAuthenticatedUser(r)
		if err != nil || user == "" {
			log.Println("Unauthorized", err)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), "username", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
