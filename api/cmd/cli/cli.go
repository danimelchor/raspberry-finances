package main

import (
	db "dmelchorpi/internal/model"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/fatih/color"

	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"

	"github.com/urfave/cli/v2"
	"golang.org/x/term"
)

func CreateUser(cCtx *cli.Context) error {
	username := cCtx.String("username")
	email := cCtx.String("email")
	password := cCtx.String("password")

	if username == "" {
		fmt.Print("Username: ")
		fmt.Scanln(&username)
	}

	if email == "" {
		fmt.Print("Email: ")
		fmt.Scanln(&email)
	}

	if password == "" {
		fmt.Print("Password: ")
		bytePassword, err := term.ReadPassword(0)
		if err != nil {
			log.Fatal("Error reading password")
		}
		password = string(bytePassword)
	}

	email = strings.TrimSpace(email)

	err := db.CreateUser(
		strings.TrimSpace(username),
		&email,
		strings.TrimSpace(password),
	)
	if err != nil {
		log.Fatal("Error creating user: ", err)
	}

	color.Green("\nUser created successfully")
	return nil
}

func GenerateRSAKeys(cCtx *cli.Context) error {
	key, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		log.Fatal("Error generating RSA keys: ", err)
	}

	// Extract public component.
	pub := key.Public()

	// Encode private key to PKCS#1 ASN.1 PEM.
	keyPEM := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PRIVATE KEY",
			Bytes: x509.MarshalPKCS1PrivateKey(key),
		},
	)

	// Encode public key to PKCS#1 ASN.1 PEM.
	pubPEM := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: x509.MarshalPKCS1PublicKey(pub.(*rsa.PublicKey)),
		},
	)

	// Write private key to file.
	if err := os.WriteFile("jwt.rsa", keyPEM, 0700); err != nil {
		log.Fatal("Error writing private key to file: ", err)
	}

	// Write public key to file.
	if err := os.WriteFile("jwt.rsa.pub", pubPEM, 0755); err != nil {
		log.Fatal("Error writing public key to file: ", err)
	}

	color.Green("RSA keys generated successfully")
	return nil
}

func main() {
	app := &cli.App{
		Commands: []*cli.Command{
			{
				Name:   "rsa",
				Usage:  "Generate RSA keys",
				Action: GenerateRSAKeys,
			},
			{
				Name:   "create-user",
				Usage:  "Create a new user",
				Action: CreateUser,
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "username",
						Usage: "The username of the new user",
					},
					&cli.StringFlag{
						Name:  "email",
						Usage: "The email of the new user",
					},
					&cli.StringFlag{
						Name:  "password",
						Usage: "The password of the new user",
					},
				},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
