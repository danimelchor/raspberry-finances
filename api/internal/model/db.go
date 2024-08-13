package db

import (
	"database/sql"
	"os"

	_ "github.com/lib/pq"
)

func OpenDB() *sql.DB {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		panic("DATABASE_URL not set")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	return db
}
