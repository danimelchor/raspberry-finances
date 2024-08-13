package main

import (
	"dmelchorpi/internal/rest"
	"flag"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type ServiceConfig struct {
	Host string
	Port string
}

func parseArgs() ServiceConfig {
	config := ServiceConfig{}
	flag.StringVar(&config.Host, "host", "0.0.0.0", "The host to run the service on")
	flag.StringVar(&config.Port, "port", "8000", "The port to run the service on")
	flag.Parse()
	return config
}

func serve(r chi.Router, config ServiceConfig) error {
	addr := fmt.Sprintf("%s:%s", config.Host, config.Port)
	fmt.Println("Listening on", addr)
	return http.ListenAndServe(addr, r)
}

func corsMiddleware(w http.ResponseWriter, r *http.Request) {
	switch origin := r.Header.Get("Origin"); origin {
	case "http://dmelchorpi", "http://127.0.0.1", "http://localhost":
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
}

func main() {
	config := parseArgs()
	r := chi.NewRouter()

	// Add middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://dmelchorpi", "http://dmelchorpi.local", "http://127.0.0.1", "http://localhost"},
		AllowedMethods:   []string{"GET", "POST"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	rest.ConfigureRouter(r)

	if err := serve(r, config); err != nil {
		fmt.Println("Error while serving the service: ", err)
	}
}
