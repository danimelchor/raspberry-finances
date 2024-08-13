package finances

import (
	db "dmelchorpi/internal/model"
	"encoding/json"
	"net/http"
)

func RunQuery(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var body struct {
		Query string `json:"query"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.Query(username, body.Query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
