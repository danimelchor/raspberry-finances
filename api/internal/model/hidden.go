package db

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

func GetHiddenMerchants(username string) ([]string, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT merchant
		FROM hidden
		WHERE username = $1
	`, username)
	if err != nil {
		return nil, err
	}

	results := []string{}
	var merchant string
	for rows.Next() {
		err = rows.Scan(&merchant)
		if err != nil {
			return nil, err
		}
		results = append(results, merchant)
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
