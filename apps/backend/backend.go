package main

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

const (
	minWidth = 24
	maxWidth = 1440

	generatorName = "sunlightmap-backend"
	apiVersion    = "4.0.0"

	dayImageFilename   = "world_mine_day_solarized_720-360_compressor.png"
	nightImageFilename = "world_mine_night_solarized_720-360_compressor.png"
)

// corsAllowedOrigin returns the origin allowed to call this API.
// Configurable via CORS_ALLOWED_ORIGIN so dev/prod can differ; falls back to
// no origin (browsers will block cross-origin reads) rather than "*", since
// this endpoint is meant to serve the sunlightmap PWA specifically.
func corsAllowedOrigin() string {
	if origin := os.Getenv("CORS_ALLOWED_ORIGIN"); origin != "" {
		return origin
	}
	return "https://sunlightmap.appspot.com"
}

// MapResponse is the GET /api/v4/map response body.
type MapResponse struct {
	Generator   GeneratorInfo `json:"generator"`
	Image       ImageInfo     `json:"image"`
	Lighting    Lighting      `json:"lighting"`
	Sources     SourceInfo    `json:"sources"`
	GeneratedAt time.Time     `json:"generatedAt"`
	RequestedAt time.Time     `json:"requestedAt"`
}

// GeneratorInfo identifies what produced the response. An object rather
// than a bare string so build/commit/model info can be added later without
// a breaking shape change.
type GeneratorInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

// ImageInfo describes the rendered overlay: both a URL to fetch it
// separately (GET /api/v4/map.png, no JSON/base64 overhead) and the same
// bytes inlined as base64 for callers that want a single round trip.
type ImageInfo struct {
	URL      string `json:"url"`
	Base64   string `json:"base64"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
	MimeType string `json:"mimeType"`
}

// Lighting is the subsolar point derived from the same sun-direction vector
// used to render the overlay. See SubsolarPoint in sunlightmap.go. The
// method's limitations (not ephemeris-grade) are documented in
// openapi.yaml, not repeated in every response.
type Lighting struct {
	SubsolarLatitude  float64 `json:"subsolarLatitude"`
	SubsolarLongitude float64 `json:"subsolarLongitude"`
	Method            string  `json:"method"`
}

// SourceInfo names the static assets blended to produce the overlay.
type SourceInfo struct {
	DayImageID   string `json:"dayImageId"`
	NightImageID string `json:"nightImageId"`
}

// ErrorResponse is the error response body for /api/v4/*.
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}

// mapParams is the parsed, validated set of inputs shared by /api/v4/map
// and /api/v4/map.png.
type mapParams struct {
	width       int
	requestedAt time.Time
}

func init() {
	//If sunlightmap.go and vec.go are packaged standalone this needs to go into an sunlightmap.init()
	//image.RegisterFormat("png", "png", png.Decode, png.DecodeConfig)

	http.HandleFunc("/api/v4/map", handlerMapMeta)
	http.HandleFunc("/api/v4/map.png", handlerMapImage)
	http.HandleFunc("/", handlerIndex)
}

func handlerIndex(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("sunlightmap"))
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	body, err := json.Marshal(ErrorResponse{Error: message, Code: code})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(status)
	w.Write(body)
}

// setCommonHeaders sets the CORS/method headers shared by both /api/v4/map
// and /api/v4/map.png, and reports whether the request still needs handling
// (false for an OPTIONS preflight or a rejected method, both already
// responded to).
func setCommonHeaders(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")
	w.Header().Set("Access-Control-Allow-Origin", corsAllowedOrigin())
	w.Header().Set("Access-Control-Allow-Methods", "GET")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "only GET is supported")
		return false
	}
	return true
}

// parseMapParams reads and validates the width/requestedAt query
// parameters shared by /api/v4/map and /api/v4/map.png. width defaults to
// 720, requestedAt to now. Height is not an independent input: the
// underlying sunlightlib always derives it as width/2.
func parseMapParams(w http.ResponseWriter, r *http.Request) (mapParams, bool) {
	width := 720
	if v := r.URL.Query().Get("width"); v != "" {
		parsed, err := strconv.Atoi(v)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid_width", "width must be an integer")
			return mapParams{}, false
		}
		width = parsed
	}
	if width < minWidth || width > maxWidth {
		writeError(w, http.StatusBadRequest, "invalid_width", "width must be between "+strconv.Itoa(minWidth)+" and "+strconv.Itoa(maxWidth))
		return mapParams{}, false
	}

	requestedAt := time.Now().Local()
	if v := r.URL.Query().Get("requestedAt"); v != "" {
		parsed, err := time.Parse(time.RFC3339, v)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid_requested_at", "requestedAt must be RFC3339")
			return mapParams{}, false
		}
		requestedAt = parsed
	}

	return mapParams{width: width, requestedAt: requestedAt}, true
}

func newRenderer(p mapParams) sunlightlib {
	slm := NewStatic(p.width, p.requestedAt)
	slm.DaylightImageFilename = dayImageFilename
	slm.NighttimeImageFilename = nightImageFilename
	return slm
}

// handlerMapMeta returns metadata about the current day/night overlay and
// a URL to fetch the rendered PNG from.
//
// GET /api/v4/map?width=720&requestedAt=2006-01-02T15:04:05Z07:00
func handlerMapMeta(w http.ResponseWriter, r *http.Request) {
	if !setCommonHeaders(w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")

	params, ok := parseMapParams(w, r)
	if !ok {
		return
	}

	slm := newRenderer(params)

	imgBytes, err := ReturnStaticPng(&slm)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "render_failed", "couldn't generate the map image")
		return
	}

	imageURL := "/api/v4/map.png?" + url.Values{
		"width":       {strconv.Itoa(params.width)},
		"requestedAt": {params.requestedAt.Format(time.RFC3339)},
	}.Encode()

	lat, lon := SubsolarPoint(params.requestedAt)

	resp := MapResponse{
		Generator: GeneratorInfo{Name: generatorName, Version: apiVersion},
		Image: ImageInfo{
			URL:      imageURL,
			Base64:   base64.StdEncoding.EncodeToString(imgBytes),
			Width:    slm.Width,
			Height:   slm.Height,
			MimeType: "image/png",
		},
		Lighting: Lighting{
			SubsolarLatitude:  lat,
			SubsolarLongitude: lon,
			Method:            "cosine-approximation",
		},
		Sources: SourceInfo{
			DayImageID:   dayImageFilename,
			NightImageID: nightImageFilename,
		},
		GeneratedAt: time.Now().Local(),
		RequestedAt: params.requestedAt,
	}

	// Marshal fully before writing anything: once WriteHeader/Write has been
	// called the 200 status is committed and a failure here could no longer
	// be turned into a 500.
	body, err := json.Marshal(resp)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "encode_failed", err.Error())
		return
	}
	w.Write(body)
}

// handlerMapImage returns the current day/night overlay as a raw PNG.
//
// GET /api/v4/map.png?width=720&requestedAt=2006-01-02T15:04:05Z07:00
func handlerMapImage(w http.ResponseWriter, r *http.Request) {
	if !setCommonHeaders(w, r) {
		return
	}

	params, ok := parseMapParams(w, r)
	if !ok {
		return
	}

	slm := newRenderer(params)

	imgBytes, err := ReturnStaticPng(&slm)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "render_failed", "couldn't generate the map image")
		return
	}

	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Length", strconv.Itoa(len(imgBytes)))
	w.Write(imgBytes)
}
