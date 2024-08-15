package db

type QueryResult struct {
	Rows    []interface{} `json:"rows"`
	Columns []string      `json:"columns"`
}

var CTES = []string{
	`CREATE TEMP TABLE categories AS (
		SELECT merchant, category, updated_at
		FROM categories
		WHERE username = $1
	);`,
	`CREATE TEMP TABLE statements AS (
		SELECT date, merchant, amount, source
		FROM statements
		WHERE username = $1
	);`,
	`CREATE TEMP TABLE hidden AS (
		SELECT merchant, updated_at
		FROM hidden
		WHERE username = $1
	);`,
	`CREATE TEMP TABLE all_data AS (
		SELECT
	      s.date,
	      s.merchant,
	      s.amount,
	      s.source,
	      coalesce(c.category, 'Uncategorized') as category
		FROM statements s
		LEFT JOIN categories c ON s.merchant = c.merchant
		WHERE $1 = $1
		AND s.merchant NOT IN (SELECT merchant FROM hidden)
	);`,
}

func RunQuery(username string, query Query) (*QueryResult, error) {
	db := OpenDB()
	for _, q := range CTES {
		_, err := db.Exec(q, username)
		if err != nil {
			return nil, err
		}
	}

	rows, err := db.Query(query.Sql)
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

	// Save to history
	err = SaveQueryToHistory(username, query)
	if err != nil {
		return nil, err
	}

	res := &QueryResult{
		Rows:    results,
		Columns: columns,
	}
	return res, nil
}
