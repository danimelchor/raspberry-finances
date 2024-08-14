package db

import "time"

func CategorizeMerchant(username string, merchant string, category string) error {
	db := OpenDB()

	stmt, err := db.Prepare(`
		INSERT INTO categories (merchant, category, username)
		VALUES ($1, $2, $3)
		ON CONFLICT (merchant, username) DO UPDATE
		SET category = $2
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(merchant, category, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}

type Category struct {
	Merchant  string    `json:"merchant"`
	Category  string    `json:"category"`
	UpdatedAt time.Time `json:"updated_at"`
}

func GetCategories(username string) ([]Category, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT merchant, category, updated_at
		FROM categories
		WHERE username = $1
		ORDER BY updated_at DESC
	`, username)
	if err != nil {
		return nil, err
	}

	categories := []Category{}
	var row Category
	for rows.Next() {
		err := rows.Scan(&row.Merchant, &row.Category, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, row)
	}

	return categories, nil
}

func UncategorizeMerchant(username string, merchant string) error {
	db := OpenDB()

	stmt, err := db.Prepare(`
		DELETE FROM categories
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
