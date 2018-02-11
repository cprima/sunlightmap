// This Go package calls the sunlightmap package and serves requests with json responses.
// It is split in two files to cater several cloud provider's toolchains,
// e.g. Google Apps Engine does handle func main() a bit special.
// So GAE's app.yaml excludes main.go
package main

import (
	"net/http"
	"os"
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

	http.ListenAndServe(":"+port, nil)
}
