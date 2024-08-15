package finances

import (
	db "dmelchorpi/internal/model"
	"encoding/json"
	"log"
	"net/http"
)

func GetOrSearchHistory(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	query := r.URL.Query().Get("q")

	var history []db.History
	var err error

	if query == "" {
		history, err = db.GetHistory(username)
	} else {
		history, err = db.SearchHistory(username, query)
	}
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = json.NewEncoder(w).Encode(history)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func UpdateHistory(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	var body db.History
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.UpdateHistory(username, body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = json.NewEncoder(w).Encode(body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
