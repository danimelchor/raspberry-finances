package rest

import (
	"dmelchorpi/internal/rest/finances"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Healthy")))
}

func ConfigureRouter(r chi.Router) {
	r.Get("/health", Health)
	r.Route("/auth", ConfigureAuthRoutes)
	r.Route("/", func(r chi.Router) {
		r.Use(AuthMiddleware)
		finances.ConfigureRoutes(r)
	})
}
