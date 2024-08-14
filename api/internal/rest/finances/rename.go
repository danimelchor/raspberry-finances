package finances

import (
	db "dmelchorpi/internal/model"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func RenameMerchant(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var body struct {
		OriginalMerchant string `json:"original_merchant"`
		NewMerchant      string `json:"new_merchant"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.RenameMerchant(username, body.OriginalMerchant, body.NewMerchant)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}

func GetRenamedMerchants(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	renamed, err := db.GetRenamedMerchants(username)
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

func DeleteMerchantRename(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var body struct {
		OriginalMerchant string `json:"original_merchant"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.DeleteMerchantRename(username, body.OriginalMerchant)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}
