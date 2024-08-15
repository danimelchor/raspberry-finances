package db

func SaveQueryToHistory(username string, query Query) error {
	db := OpenDB()
	defer db.Close()

	var err error
	if query.Id != 0 {
		_, err = db.Exec(`
			UPDATE query_history
			SET updated_at = now(), title = $1, display_type = $2, pinned = $3, query = $4
			WHERE username = $5
			AND id = $6
		`, query.Title, query.DisplayType, query.Pinned, query.Sql, username, query.Id)
	} else {
		_, err = db.Exec(`
			INSERT INTO query_history (username, query, title, display_type, pinned)
			VALUES ($1, $2, $3, $4, $5)
		`, username, query.Sql, query.Title, query.DisplayType, query.Pinned)
	}

	return err
}

type Query struct {
	Id          int    `json:"id"`
	Sql         string `json:"sql"`
	UpdatedAt   string `json:"updated_at"`
	Pinned      bool   `json:"pinned"`
	Title       string `json:"title"`
	DisplayType string `json:"display_type"`
}

func GetHistory(username string) ([]Query, error) {
	db := OpenDB()
	defer db.Close()

	rows, err := db.Query(`
		SELECT id, query, updated_at, pinned, title, display_type
		FROM query_history
		WHERE username = $1
		ORDER BY
		  pinned DESC,
		  updated_at DESC
		LIMIT 20
	`, username)
	if err != nil {
		return nil, err
	}

	history := []Query{}
	var row Query
	for rows.Next() {
		err := rows.Scan(
			&row.Id,
			&row.Sql,
			&row.UpdatedAt,
			&row.Pinned,
			&row.Title,
			&row.DisplayType,
		)
		if err != nil {
			return nil, err
		}
		history = append(history, row)
	}

	return history, nil
}

func SearchHistory(username, query string) ([]Query, error) {
	db := OpenDB()
	defer db.Close()

	rows, err := db.Query(`
		SELECT id, query, updated_at, pinned, title, display_type
		FROM query_history
		WHERE username = $1
		AND (
		  lower(query) LIKE '%' || lower($2) || '%'
		  OR lower(title) LIKE '%' || lower($2) || '%'
		)
		ORDER BY
		  pinned DESC,
		  updated_at DESC
		LIMIT 20
	`, username, query)
	if err != nil {
		return nil, err
	}

	history := []Query{}
	var row Query
	for rows.Next() {
		err := rows.Scan(
			&row.Id,
			&row.Sql,
			&row.UpdatedAt,
			&row.Pinned,
			&row.Title,
			&row.DisplayType,
		)
		if err != nil {
			return nil, err
		}
		history = append(history, row)
	}

	return history, nil
}

func GetHistoryById(username, id string) (Query, error) {
	db := OpenDB()
	defer db.Close()

	row := db.QueryRow(`
		SELECT id, query, updated_at, pinned, title, display_type
		FROM query_history
		WHERE username = $1
		AND id = $2
	`, username, id)

	var q Query
	err := row.Scan(&q.Id, &q.Sql, &q.UpdatedAt, &q.Pinned, &q.Title, &q.DisplayType)
	return q, err
}

func UpdateHistory(username string, query Query) error {
	db := OpenDB()
	defer db.Close()
	_, err := db.Exec(`
		UPDATE query_history
		SET pinned = $2, title = $3, display_type = $4, query = $5
		WHERE username = $1
		AND id = $6
	`, username, query.Pinned, query.Title, query.DisplayType, query.Sql, query.Id)
	return err
}
