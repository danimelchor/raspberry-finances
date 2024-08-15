package db

func SaveQueryToHistory(username, query string) error {
	db := OpenDB()
	defer db.Close()

	// Insert or update timestamp if query already exists
	_, err := db.Exec(`
		INSERT INTO query_history (username, query)
		VALUES ($1, $2)
		ON CONFLICT (username, query) DO UPDATE
		SET updated_at = NOW()
	`, username, query)

	return err
}

type History struct {
	Query       string `json:"query"`
	CreatedAt   string `json:"created_at"`
	Pinned      bool   `json:"pinned"`
	Title       string `json:"title"`
	DisplayType string `json:"display_type"`
}

func GetHistory(username string) ([]History, error) {
	db := OpenDB()
	defer db.Close()

	rows, err := db.Query(`
		SELECT query, updated_at, pinned, title, display_type
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

	history := []History{}
	var row History
	for rows.Next() {
		err := rows.Scan(&row.Query, &row.CreatedAt, &row.Pinned, &row.Title, &row.DisplayType)
		if err != nil {
			return nil, err
		}
		history = append(history, row)
	}

	return history, nil
}

func SearchHistory(username, query string) ([]History, error) {
	db := OpenDB()
	defer db.Close()

	rows, err := db.Query(`
		SELECT query, updated_at, pinned, title, display_type
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

	history := []History{}
	var row History
	for rows.Next() {
		err := rows.Scan(&row.Query, &row.CreatedAt, &row.Pinned, &row.Title, &row.DisplayType)
		if err != nil {
			return nil, err
		}
		history = append(history, row)
	}

	return history, nil
}

func UpdateHistory(username string, history History) error {
	db := OpenDB()
	defer db.Close()
	_, err := db.Exec(`
		UPDATE query_history
		SET pinned = $1, title = $2, display_type = $3
		WHERE username = $4
		AND query = $5
	`, history.Pinned, history.Title, history.DisplayType, username, history.Query)
	return err
}
