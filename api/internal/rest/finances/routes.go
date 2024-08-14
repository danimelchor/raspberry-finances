package finances

import (
	"github.com/go-chi/chi/v5"
)

func ConfigureRoutes(r chi.Router) {
	r.Post("/run", RunQuery)
	r.Post("/upload", UploadFiles)

	// Hidden merchants
	r.Post("/hide", HideMerchant)
	r.Get("/hidden", GetHiddenMerchants)
	r.Delete("/hide", UnhideMerchant)

	// Renames
	r.Post("/rename", RenameMerchant)
	r.Get("/renamed", GetRenamedMerchants)
	r.Delete("/rename", DeleteMerchantRename)

	// Categories
	r.Post("/categorize", CategorizeMerchant)
	r.Get("/categorized", GetCategories)
	r.Delete("/categorize", UncategorizeMerchant)
}
