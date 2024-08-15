package main

import (
	db "dmelchorpi/internal/model"
	"fmt"
	"github.com/fatih/color"
	"github.com/urfave/cli/v2"
	"golang.org/x/term"
	"log"
	"os"
	"strings"
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

func main() {
	app := &cli.App{
		Commands: []*cli.Command{
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
