package finances

import (
	db "dmelchorpi/internal/model"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func CategorizeMerchant(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	var req struct {
		Merchant string `json:"merchant"`
		Category string `json:"category"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = db.CategorizeMerchant(username, req.Merchant, req.Category)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}

func GetCategories(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	categories, err := db.GetCategories(username)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	err = json.NewEncoder(w).Encode(categories)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func UncategorizeMerchant(w http.ResponseWriter, r *http.Request) {
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

	err = db.UncategorizeMerchant(username, req.Merchant)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprint(w, "Ok")
}
