package rest

import (
	"dmelchorpi/internal/rest/finances"
	"dmelchorpi/internal/security"
	"fmt"
	"github.com/go-chi/chi/v5"
	"net/http"
)

func Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Healthy")))
}

func ConfigureRouter(r chi.Router) {
	r.Get("/health", Health)
	r.Route("/", func(r chi.Router) {
		r.Use(security.AuthMiddleware)
		finances.ConfigureRoutes(r)
	})
}
