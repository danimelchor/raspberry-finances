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

type QueryResult struct {
	Rows    []interface{} `json:"rows"`
	Columns []string      `json:"columns"`
}

// TODO: how the hell can I make this safe
func perUserContext() []string {
	tables := map[string][]string{
		"statements": {
			"date",
			"merchant",
			"amount",
			"category",
			"source",
		},
	}

	ctes := []string{}
	for table, columns := range tables {
		columnsStr := ""
		for i, column := range columns {
			if i != 0 {
				columnsStr += ", "
			}
			columnsStr += column
		}

		ctes = append(ctes, fmt.Sprintf(`
			CREATE TEMP TABLE %s AS (
				SELECT %s
				FROM %s
				WHERE username = $1
			);
		`, table, columnsStr, table))
	}
	return ctes
}

func Query(username string, query string) (*QueryResult, error) {
	db := OpenDB()
	queries := perUserContext()
	for _, q := range queries {
		_, err := db.Exec(q, username)
		if err != nil {
			return nil, err
		}
	}
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	results := []interface{}{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		for i := range values {
			values[i] = new(interface{})
		}
		err = rows.Scan(values...)
		if err != nil {
			return nil, err
		}
		results = append(results, values)
	}

	rows.Close()
	db.Close()

	res := &QueryResult{
		Rows:    results,
		Columns: columns,
	}
	return res, nil
}
