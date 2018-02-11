package main

import (
	"encoding/json"
	"image"
	"image/png"
	"io/ioutil"
	"net/http"
	"strings"
	"sunlightmap"
	"time"
)

// Return holds the outgoing Response in json format
type Return struct {
	Success     string
	GeneratedAt time.Time
	Imgbase64   string
	Width       int
	Height      int
	Request     Request
}

// Request is the incoming http request in json format
type Request struct {
	Width       int
	Height      int
	RequestedAt string
}

func init() {
	//If sunlightmap.go and vec.go are packaged standalone this needs to go into an sunlightmap.init()
	image.RegisterFormat("png", "png", png.Decode, png.DecodeConfig)

	http.HandleFunc("/v2/test", handler)
	//http.HandleFunc("/slm", sunlightmap.SampleHandlerTest)
	http.HandleFunc("/", handlerIndex)
}

// //func main is replaced by GAE Google Apps Engine
// //Here it serves as local development backend
// func main() {

// 	//Bluemix sets the environment variable PORT
// 	//https://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html
// 	//cf env backend
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8080" //Local
// 	}

// 	http.ListenAndServe(":"+port, nil)
// }

func handlerIndex(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("sunlightmap"))
}

func handler(w http.ResponseWriter, r *http.Request) {
	//Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With
	w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST")
	w.Header().Set("Content-Type", "application/json")

	retval := Return{"unknown", time.Now().Local(), "", 0, 0, Request{}}

	defer r.Body.Close()
	var req Request

	if body, err := ioutil.ReadAll(r.Body); err != nil {
		retval.Success = "nok1"
		//fmt.Fprintf(w, "Couldn't read request body: %s", err)
	} else {
		//fmt.Fprintf(w, "body is: %s", body)
		dec := json.NewDecoder(strings.NewReader(string(body)))
		if err := dec.Decode(&req); err != nil {
			//fmt.Fprintf(w, "Couldn't decode JSON: %s", err)
			retval.Success = "nok2"
		} else {
			//fmt.Fprintf(w, "Value of Param1 is: %s", req.Datetime)
			//noop
			retval.Success = "OK"
		}
	}

	//slm := sunlightmap.NewStatic(720, time.Now().Local())
	slm := sunlightmap.NewStatic(720, time.Now().Local())
	slm.DaylightImageFilename = "world_mine_day_solarized_720-360_fixme-compressor.png"
	slm.NighttimeImageFilename = "world_mine_night_solarized_720-360_fixme-compressor.png"
	//slm.Now()

	//retval.Imgbase64, _ = sunlightmap.ReturnStaticPngBase64(&slm)
	retval.Imgbase64, _ = sunlightmap.ReturnStaticPngBase64(&slm)
	retval.Width = slm.Width
	retval.Height = slm.Height
	retval.Success = "ok"

	json, err := json.Marshal(retval)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	//_ = json
	//htmlImage := "<html><body><img width='720' height='360' src='data:image/png;base64," + retval.Imgbase64 + "' /></body></html>"
	//fmt.Fprint(w, htmlImage)

	w.Write(json)
}
