package db

import (
	"fmt"
	"log"
	"time"
)

type StatementRow struct {
	Date     time.Time `json:"date"`
	Merchant string    `json:"merchant"`
	Amount   float32   `json:"amount"`
	Category string    `json:"category"`
	Source   string    `json:"source"`
}

func (s *StatementRow) ToString() string {
	return fmt.Sprintf("%s %s %.2f %s %s", s.Date.Format("2006-01-02"), s.Merchant, s.Amount, s.Category, s.Source)
}

func InsertStatements(username string, statements []StatementRow) error {
	db := OpenDB()

	// Insert
	stmt, err := db.Prepare(`
		INSERT INTO statements (username, date, merchant, amount, category, source)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT DO NOTHING;
	`)
	if err != nil {
		log.Println("Error running insert statement", err)
		return err
	}

	// insert
	for _, statement := range statements {
		if err != nil {
			return err
		}

		_, err = stmt.Exec(
			username,
			statement.Date,
			statement.Merchant,
			statement.Amount,
			statement.Category,
			statement.Source,
		)
		if err != nil {
			return err
		}
	}

	stmt.Close()
	db.Close()
	return nil
}
