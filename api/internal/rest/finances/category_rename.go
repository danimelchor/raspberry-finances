package finances

import (
	db "dmelchorpi/internal/model"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func RenameCategory(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var body struct {
		OriginalCategory string `json:"original_category"`
		NewCategory      string `json:"new_category"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.RenameCategory(username, body.OriginalCategory, body.NewCategory)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}

func GetRenamedCategories(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	renamed, err := db.GetRenamedCategories(username)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = json.NewEncoder(w).Encode(renamed)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func DeleteCategoryRename(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var body struct {
		OriginalCategory string `json:"original_category"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.DeleteCategoryRename(username, body.OriginalCategory)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}
