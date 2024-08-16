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

func RenameMerchants(username string, statements []StatementRow) ([]StatementRow, error) {
	renames, err := GetRenamedMerchants(username)
	if err != nil {
		return nil, err
	}

	for _, rename := range renames {
		for i, statement := range statements {
			if statement.Merchant == rename.OriginalMerchant {
				statements[i].Merchant = rename.NewMerchant
			}
		}
	}

	return statements, nil
}

func RenameCategories(username string, statements []StatementRow) ([]StatementRow, error) {
	category_renames, err := GetRenamedCategories(username)
	if err != nil {
		return nil, err
	}

	for _, rename := range category_renames {
		for i, statement := range statements {
			if statement.Category == rename.OriginalCategory {
				statements[i].Category = rename.NewCategory
			}
		}
	}

	return statements, nil
}

func InsertStatements(username string, statements []StatementRow) error {
	db := OpenDB()

	// Renames merchants
	statements, err := RenameMerchants(username, statements)
	if err != nil {
		return err
	}

	// Renames categories
	statements, err = RenameCategories(username, statements)
	if err != nil {
		return err
	}

	// Insert statement
	statement_stmt, err := db.Prepare(`
		INSERT INTO statements (username, date, merchant, amount, source)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT DO NOTHING;
	`)
	if err != nil {
		log.Println("Error preparing insert statement", err)
		return err
	}

	// Insert category
	category_stmt, err := db.Prepare(`
		INSERT INTO categories (username, merchant, category)
		VALUES ($1, $2, $3)
		ON CONFLICT (username, merchant) DO NOTHING;
	`)
	if err != nil {
		log.Println("Error preparing insert category", err)
		return err
	}

	// insert
	for _, statement := range statements {
		if err != nil {
			return err
		}

		_, err = statement_stmt.Exec(
			username,
			statement.Date,
			statement.Merchant,
			statement.Amount,
			statement.Source,
		)
		if err != nil {
			return err
		}

		_, err = category_stmt.Exec(
			username,
			statement.Merchant,
			statement.Category,
		)
		if err != nil {
			return err
		}
	}

	statement_stmt.Close()
	db.Close()
	return nil
}
