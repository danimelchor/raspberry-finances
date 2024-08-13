package finances

import (
	"encoding/json"
	"log"
	"net/http"
)

func FormatQuery(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Query string `json:"query"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Write([]byte(body.Query))
}
