package db

import "time"

func RenameCategory(username string, original_category string, new_category string) error {
	db := OpenDB()

	// Store new renamed category
	stmt, err := db.Prepare(`
		INSERT INTO category_renames (original_category, new_category, username)
		VALUES ($1, $2, $3)
		ON CONFLICT (original_category, username) DO UPDATE
		SET new_category = $2
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(original_category, new_category, username)
	if err != nil {
		return err
	}

	// Update existing renames
	stmt, err = db.Prepare(`
		UPDATE category_renames
		SET new_category = $1
		WHERE new_category = $2
		AND username = $3
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(new_category, original_category, username)
	if err != nil {
		return err
	}

	// Backfill all statements
	stmt, err = db.Prepare(`
		UPDATE categories
		SET category = $1
		WHERE category = $2
		AND username = $3
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(new_category, original_category, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}

type CategoryRename struct {
	OriginalCategory string    `json:"original_category"`
	NewCategory      string    `json:"new_category"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func GetRenamedCategories(username string) ([]CategoryRename, error) {
	db := OpenDB()
	rows, err := db.Query(`
		SELECT original_category, new_category, updated_at
		FROM category_renames
		WHERE username = $1
		ORDER BY updated_at DESC
	`, username)
	if err != nil {
		return nil, err
	}

	renames := []CategoryRename{}
	var row CategoryRename
	for rows.Next() {
		err = rows.Scan(&row.OriginalCategory, &row.NewCategory, &row.UpdatedAt)
		if err != nil {
			return nil, err
		}
		renames = append(renames, row)
	}

	db.Close()
	return renames, nil
}

func DeleteCategoryRename(username string, original_category string) error {
	db := OpenDB()

	// Delete renamed category
	stmt, err := db.Prepare(`
		DELETE FROM category_renames
		WHERE original_category = $1
		AND username = $2
	`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(original_category, username)
	if err != nil {
		return err
	}

	stmt.Close()
	db.Close()
	return nil
}
