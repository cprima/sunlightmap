package sunlightmap

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestNew_odd(t *testing.T) {
	slms := New(25, "static", []time.Time{time.Now().Local()})
	actualResult := slms.Width
	expectedResult := 24
	if actualResult != expectedResult {
		t.Fatalf("Expected %v but got %v", expectedResult, actualResult)
	}
}

func ExampleNewStatic() {
	slms := NewStatic(360, time.Now().Local())
	fmt.Println(slms.visualization)
	// Output:
	// static
}

func TestReturnStaticBase64(t *testing.T) {

	//the png header format
	expectedResult := []byte{137, 80, 78, 71, 13, 10, 26, 10}

	slm := NewStatic(720, time.Now().Local())
	encoded, _ := ReturnStaticPngBase64(&slm)
	unbased, _ := base64.StdEncoding.DecodeString(string(encoded))

	reader := bytes.NewReader(unbased)
	pngheader := make([]byte, 8)
	_, _ = reader.Read(pngheader)

	//for k, v := range pngheader {
	//	fmt.Println(k, v, expectedResult[k])
	//}

	if !bytes.Equal(pngheader, expectedResult) {
		t.Fatalf("Expected %v but got %v", expectedResult, pngheader)
	}

}

func TestCaclulateASCII(t *testing.T) {

	slm := NewStatic(24, time.Date(2017, 10, 24, 17, 30, 0, 0, time.UTC))
	actualResult := caclulateASCII(&slm, "")
	expectedResult := "██████████████████████████████████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██████████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██████████████████████▒▒▒▒▒▒▒▒▒▒▒▒░░░░▒▒▒▒▒▒▒▒▒▒▒▒████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"

	if actualResult != expectedResult {
		t.Fatalf("Expected %s but got %s", expectedResult, actualResult)
	}

}

func ExampleReturnStaticPngBase64() {
	handler := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		slm := NewStatic(720, time.Now().Local())
		encoded, _ := ReturnStaticPngBase64(&slm)
		html := "<html><body><img src='data:image/png;base64," + encoded + "' /><p>"
		fmt.Fprint(w, html)
	}
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "http://example.com", nil)

	handler(w, req)

	resp := w.Result()

	fmt.Println(resp.StatusCode)

	// Output:
	// 200

}
