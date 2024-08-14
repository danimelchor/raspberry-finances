package db

import "time"

func HideMerchant(username string, merchant string) error {
	db := OpenDB()

	// Store new hidden merchant
	stmt, err := db.Prepare(`
		INSERT INTO hidden (merchant, username)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`)
	if err != nil {
		return err
	}
	_, err = stmt.Exec(merchant, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}

type Hidden struct {
	Merchant  string    `json:"merchant"`
	UpdatedAt time.Time `json:"updated_at"`
}

func GetHiddenMerchants(username string) ([]Hidden, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT merchant, updated_at
		FROM hidden
		WHERE username = $1
		ORDER BY updated_at DESC
	`, username)
	if err != nil {
		return nil, err
	}

	results := []Hidden{}
	var row Hidden
	for rows.Next() {
		err = rows.Scan(&row.Merchant, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}
		results = append(results, row)
	}

	rows.Close()
	db.Close()
	return results, nil
}

func UnhideMerchant(username string, merchant string) error {
	db := OpenDB()

	// Delete hidden merchant
	stmt, err := db.Prepare(`
		DELETE FROM hidden
		WHERE merchant = $1
		AND username = $2
	`)
	if err != nil {
		return err
	}
	_, err = stmt.Exec(merchant, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}
