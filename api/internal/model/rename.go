package db

import "time"

func RenameMerchant(username string, original_merchant string, new_merchant string) error {
	db := OpenDB()

	// Store new renamed merchant
	stmt, err := db.Prepare(`
		INSERT INTO renames (original_merchant, new_merchant, username)
		VALUES ($1, $2, $3)
		ON CONFLICT DO UPDATE
		SET new_merchant = $2
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

type Rename struct {
	OriginalMerchant string    `json:"original_merchant"`
	NewMerchant      string    `json:"new_merchant"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func GetRenamedMerchants(username string) ([]Rename, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT original_merchant, new_merchant, updated_at
		FROM renames
		WHERE username = $1
		ORDER BY updated_at DESC
	`, username)
	if err != nil {
		return nil, err
	}

	renames := []Rename{}
	var row Rename
	for rows.Next() {
		err = rows.Scan(&row.OriginalMerchant, &row.NewMerchant, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}
		renames = append(renames, row)
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
