package finances

import (
	db "dmelchorpi/internal/model"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func HideMerchant(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var req struct {
		Merchant string `json:"merchant"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.HideMerchant(username, req.Merchant)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}

func GetHiddenMerchants(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	hidden, err := db.GetHiddenMerchants(username)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = json.NewEncoder(w).Encode(hidden)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func UnhideMerchant(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var req struct {
		Merchant string `json:"merchant"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.UnhideMerchant(username, req.Merchant)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}
