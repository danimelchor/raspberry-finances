package db

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string  `json:"username"`
	Email    *string `json:"email"`
	Password string  `json:"password"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func Login(username string, password string) (*User, error) {
	db := OpenDB()

	// Get user from db
	row := db.QueryRow("SELECT username, email, password FROM users WHERE username = $1", username)
	user := User{}
	err := row.Scan(&user.Username, &user.Email, &user.Password)
	if err != nil {
		return nil, err
	}
	db.Close()

	// Validate
	if !CheckPasswordHash(password, user.Password) {
		return nil, fmt.Errorf("Invalid password")
	}

	return &user, nil
}

func CreateUser(
	username string,
	email *string,
	password string,
) error {
	db := OpenDB()

	// Check if user exists
	row := db.QueryRow("SELECT username FROM users WHERE username = $1", username)
	user := User{}
	err := row.Scan(&user.Username)
	if err == nil {
		return fmt.Errorf("User already exists")
	}

	// Hash password
	hash, err := HashPassword(password)
	if err != nil {
		return err
	}

	// Insert user
	_, err = db.Exec(
		"INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
		username,

		email,
		hash,
	)
	if err != nil {
		return err
	}

	db.Close()
	return nil
}

func GetUser(username string) (*User, error) {
	db := OpenDB()

	// Get user from db
	row := db.QueryRow("SELECT username, email FROM users WHERE username = $1", username)
	user := User{}
	err := row.Scan(&user.Username, &user.Email)
	if err != nil {
		return nil, err
	}

	db.Close()
	return &user, nil
}

func UpdateUser(username, email, password string, newPassword *string) error {
	db := OpenDB()

	// Load user
	row := db.QueryRow("SELECT password FROM users WHERE username = $1", username)
	user := User{}
	err := row.Scan(&user.Password)
	if err != nil {
		return err
	}

	// Validate password
	if !CheckPasswordHash(password, user.Password) {
		return fmt.Errorf("Invalid password")
	}

	// Hash new password
	if newPassword != nil {
		hash, err := HashPassword(*newPassword)
		if err != nil {
			return err
		}

		// Update user
		_, err = db.Exec(
			"UPDATE users SET email = $1, password = $2 WHERE username = $3",
			email,
			hash,
			username,
		)
	} else {
		// Update user
		_, err = db.Exec(
			"UPDATE users SET email = $1 WHERE username = $2",
			email,
			username,
		)
	}
	if err != nil {
		return err
	}

	db.Close()
	return nil
}
