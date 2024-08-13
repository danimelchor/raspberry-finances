package finances

import (
	"github.com/go-chi/chi/v5"
)

func ConfigureRoutes(r chi.Router) {
	r.Post("/run", RunQuery)
	r.Post("/format", FormatQuery)
	r.Post("/upload", UploadFiles)
}
