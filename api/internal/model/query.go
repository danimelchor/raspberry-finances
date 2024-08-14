package db

import (
	"fmt"
)

type QueryResult struct {
	Rows    []interface{} `json:"rows"`
	Columns []string      `json:"columns"`
}

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
