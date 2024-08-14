package db

func RenameMerchant(username string, original_merchant string, new_merchant string) error {
	db := OpenDB()

	// Store new renamed merchant
	stmt, err := db.Prepare(`
		INSERT INTO renames (original_merchant, new_merchant, username)
		VALUES ($1, $2, $3)
		ON CONFLICT DO NOTHING
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(original_merchant, new_merchant, username)
	if err != nil {
		return err
	}

	// Update existing renames
	stmt, err = db.Prepare(`
		UPDATE renames
		SET new_merchant = $1
		WHERE new_merchant = $2
		AND username = $3
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(new_merchant, original_merchant, username)
	if err != nil {
		return err
	}

	// Backfill all statements
	stmt, err = db.Prepare(`
		UPDATE statements
		SET merchant = $1
		WHERE merchant = $2
		AND username = $3
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(new_merchant, original_merchant, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}

func GetRenamedMerchants(username string) (map[string]string, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT original_merchant, new_merchant
		FROM renames
		WHERE username = $1
	`, username)
	if err != nil {
		return nil, err
	}

	renames := map[string]string{}
	for rows.Next() {
		var original_merchant string
		var new_merchant string
		err = rows.Scan(&original_merchant, &new_merchant)
		if err != nil {
			return nil, err
		}
		renames[original_merchant] = new_merchant
	}

	db.Close()
	return renames, nil
}

func DeleteMerchantRename(username string, original_merchant string) error {
	db := OpenDB()

	// Delete renamed merchant
	stmt, err := db.Prepare(`
		DELETE FROM renames
		WHERE original_merchant = $1
		AND username = $2
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(original_merchant, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}
