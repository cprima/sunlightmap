package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandlerMapMeta_OK(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v4/map", nil)
	w := httptest.NewRecorder()

	handlerMapMeta(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if ct := resp.Header.Get("Content-Type"); ct != "application/json" {
		t.Fatalf("expected application/json, got %q", ct)
	}

	var body MapResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("couldn't decode response: %v", err)
	}
	if body.Image.Width != 720 || body.Image.Height != 360 {
		t.Fatalf("expected 720x360, got %dx%d", body.Image.Width, body.Image.Height)
	}
	if body.Image.URL == "" {
		t.Fatal("expected non-empty image.url")
	}
	if body.Image.Base64 == "" {
		t.Fatal("expected non-empty image.base64")
	}
	if body.Generator.Name == "" || body.Generator.Version == "" {
		t.Fatal("expected generator name and version")
	}
}

func TestHandlerMapMeta_ResponseShape(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v4/map", nil)
	w := httptest.NewRecorder()

	handlerMapMeta(w, req)

	var raw map[string]interface{}
	if err := json.NewDecoder(w.Result().Body).Decode(&raw); err != nil {
		t.Fatalf("couldn't decode response: %v", err)
	}

	for _, field := range []string{"generator", "image", "lighting", "sources", "generatedAt", "requestedAt"} {
		if _, ok := raw[field]; !ok {
			t.Fatalf("expected field %q in response, got %v", field, raw)
		}
	}

	image, ok := raw["image"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected image to be an object, got %v", raw["image"])
	}
	for _, field := range []string{"url", "base64", "width", "height", "mimeType"} {
		if _, ok := image[field]; !ok {
			t.Fatalf("expected field %q in image, got %v", field, image)
		}
	}

	lighting, ok := raw["lighting"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected lighting to be an object, got %v", raw["lighting"])
	}
	for _, field := range []string{"subsolarLatitude", "subsolarLongitude", "method"} {
		if _, ok := lighting[field]; !ok {
			t.Fatalf("expected field %q in lighting, got %v", field, lighting)
		}
	}
}

func TestHandlerMapImage_OK(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v4/map.png", nil)
	w := httptest.NewRecorder()

	handlerMapImage(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if ct := resp.Header.Get("Content-Type"); ct != "image/png" {
		t.Fatalf("expected image/png, got %q", ct)
	}

	pngHeader := []byte{137, 80, 78, 71, 13, 10, 26, 10}
	buf := make([]byte, 8)
	if _, err := resp.Body.Read(buf); err != nil {
		t.Fatalf("couldn't read body: %v", err)
	}
	if !bytes.Equal(buf, pngHeader) {
		t.Fatalf("expected PNG header, got %v", buf)
	}
}

func TestHandlerMap_WidthBounds(t *testing.T) {
	cases := []struct {
		name  string
		width string
		want  int
	}{
		{"too small", "10", http.StatusBadRequest},
		{"too large", "5000", http.StatusBadRequest},
		{"not an integer", "abc", http.StatusBadRequest},
		{"within bounds", "360", http.StatusOK},
	}

	for _, c := range cases {
		t.Run("meta/"+c.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v4/map?width="+c.width, nil)
			w := httptest.NewRecorder()
			handlerMapMeta(w, req)
			if w.Result().StatusCode != c.want {
				t.Fatalf("expected %d, got %d", c.want, w.Result().StatusCode)
			}
		})
		t.Run("image/"+c.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/v4/map.png?width="+c.width, nil)
			w := httptest.NewRecorder()
			handlerMapImage(w, req)
			if w.Result().StatusCode != c.want {
				t.Fatalf("expected %d, got %d", c.want, w.Result().StatusCode)
			}
		})
	}
}

func TestHandlerMap_InvalidTimestamp(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v4/map?requestedAt=not-a-date", nil)
	w := httptest.NewRecorder()

	handlerMapMeta(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}

	var body ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("couldn't decode error response: %v", err)
	}
	if body.Code != "invalid_requested_at" {
		t.Fatalf("expected code invalid_requested_at, got %q", body.Code)
	}
}

func TestHandlerMap_MethodNotAllowed(t *testing.T) {
	for _, path := range []string{"/api/v4/map", "/api/v4/map.png"} {
		req := httptest.NewRequest(http.MethodPost, path, nil)
		w := httptest.NewRecorder()

		if path == "/api/v4/map" {
			handlerMapMeta(w, req)
		} else {
			handlerMapImage(w, req)
		}

		if w.Result().StatusCode != http.StatusMethodNotAllowed {
			t.Fatalf("%s: expected 405, got %d", path, w.Result().StatusCode)
		}
	}
}

func TestHandlerMap_OptionsPreflight(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/api/v4/map", nil)
	w := httptest.NewRecorder()

	handlerMapMeta(w, req)

	if w.Result().StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", w.Result().StatusCode)
	}
}
