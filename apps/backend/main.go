// This Go package calls the sunlightmap package and serves requests with json responses.
// It is split in two files to cater several cloud provider's toolchains,
// e.g. Google Apps Engine does handle func main() a bit special.
// So GAE's app.yaml excludes main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

//func main is replaced by GAE Google Apps Engine
//Here it serves as local development backend
func main() {

	//Bluemix sets the environment variable PORT
	//https://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html
	//cf env backend
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" //Local
	}

	srv := &http.Server{
		Addr:              ":" + port,
		ReadTimeout:       5 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s", err)
		}
	}()

	<-ctx.Done()
	stop()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown: %s", err)
	}
}
