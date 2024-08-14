package db

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

	// Backfill all statements
	stmt, err = db.Prepare(`
		UPDATE statements
		SET category = $1
		WHERE merchant = $2
		AND username = $3
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(category, merchant, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}

func GetCategories(username string) (map[string]string, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT merchant, category
		FROM categories
		WHERE username = $1
	`, username)
	if err != nil {
		return nil, err
	}

	categories := map[string]string{}
	for rows.Next() {
		var merchant, category string
		err := rows.Scan(&merchant, &category)
		if err != nil {
			return nil, err
		}
		categories[merchant] = category
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

	// Backfill all statements
	stmt, err = db.Prepare(`
		UPDATE statements
		SET category = ''
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
