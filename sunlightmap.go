// Copyright (c) 2017 Christian Prior-Mamulyan
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.
//
// Based on PHP code by Copyright (c) 2009, J.P.Westerhof <jurgen.westerhof@gmail.com>
// available at http://www.edesign.nl/2009/05/14/math-behind-a-world-sunlight-map/

// Package sunlightlib merges two image files of a sphere in mercator projection
// as if that sphere revolves around the sun, producing an approximate day-
// and night-visualization.
package main

import (
	"bytes"
	"encoding/base64"
	"image"
	"image/color"
	"image/png"
	"io"
	"math"
	"os"
	"strings"
	"time"
)

var (
	dayfile            *os.File
	nightfile          *os.File
	dayImage           image.Image
	nightImage         image.Image
	dayFallbackColor   = color.RGBA{253.0, 246.0, 227.0, 255.0} //base3 253 246 227
	nightFallbackColor = color.RGBA{0.0, 43.0, 54.0, 255.0}     //base03 0  43  54
)

// sunlightlib holds default values for several output formats
type sunlightlib struct {
	Width                  int
	Height                 int
	DaylightImageFilename  string
	NighttimeImageFilename string
	zeitpunkte             []time.Time
	visualization          string //static or animated (todo: animated)
	debugstring            string
}

func init() {
	image.RegisterFormat("png", "png", png.Decode, png.DecodeConfig)
}

// New returns the sunlightlib struct with default values.
// The height is always half of the width.
// visualization has currently only 'static' implemented ('animated' to follow)
func New(width int, visualization string, zeitpunkte []time.Time) (slm sunlightlib) {
	slm = sunlightlib{}
	slm.Width = width - width%2
	slm.Height = slm.Width / 2
	slm.visualization = visualization
	slm.DaylightImageFilename = "world_mine_day_solarized_720-360.png"
	slm.NighttimeImageFilename = "world_mine_night_solarized_720-360.png"
	slm.zeitpunkte = zeitpunkte //[]time.Time{time.Date(2017, 10, 24, 17, 30, 0, 0, time.UTC)}
	return
}

// NewStatic is a convenience method to return a single static sunlightlib
//
// TODO(cpr): implement animated version (e.g. gif)
func NewStatic(width int, zeitpunkt time.Time) (slm sunlightlib) {
	return New(width, "static", []time.Time{zeitpunkt})
}

// Now sets the target time to a single now()
func (s *sunlightlib) Now() bool {
	s.zeitpunkte = []time.Time{time.Now().Local()}
	s.visualization = "static"
	return true
}

// When sets datetime(s) after initialization.
func (s *sunlightlib) When(zeitpunkte []time.Time) bool {
	s.zeitpunkte = zeitpunkte
	if len(zeitpunkte) > 1 {
		s.visualization = "animated"
	} else {
		s.visualization = "static"
	}
	return true
}

type singleSunlightlib struct {
	datetime               time.Time
	datetimeUtc            time.Time
	daysInYear             int
	dayOfYear              int
	timeDayFraction        float64
	tilt                   float64
	pointingFromEarthToSun vec3
	width                  int
	height                 int
}

// newSingle returns one sunlightlib structure for a single point in time.
func newSingle(slm *sunlightlib, timestamp time.Time) (sslm singleSunlightlib) {

	sslm = singleSunlightlib{}

	sslm.datetime = timestamp
	sslm.width = slm.Width
	sslm.height = slm.Height
	//daysinYear equals this year's February days minus 28, plus 365
	sslm.daysInYear = time.Date(timestamp.Year(),
		time.February+1, 0, 0, 0, 0, 0,
		time.UTC).Day() + 365 - 28
	sslm.dayOfYear = timestamp.YearDay()
	sslm.timeDayFraction = timeDayFraction(timestamp)

	sslm.tilt = 23.5 * math.Cos((2.0*math.Pi*(float64(sslm.dayOfYear)-173.0))/float64(sslm.daysInYear))

	sslm.pointingFromEarthToSun = vec3{
		math.Sin((2.0 * math.Pi) * sslm.timeDayFraction),
		math.Tan(math.Pi * 2.0 * (sslm.tilt / 360.0)),
		math.Cos((2.0 * math.Pi) * sslm.timeDayFraction),
	}
	sslm.pointingFromEarthToSun.normalize(1)

	return
}

/*
// SampleHandlerASCII may be used to serve a 24-character wide textual output.
func SampleHandlerASCII(w http.ResponseWriter, r *http.Request) {
	datetimerange2 := []time.Time{
		time.Now().Local().AddDate(0, -1, 1),
		time.Now().Local(),
		time.Now().Local().AddDate(0, 1, 1),
	}
	_ = datetimerange2
	slm := New(25, "static", datetimerange2)
	//slm.Now()
	slm.When(datetimerange2)
	//slm.Now()
	fmt.Fprintf(w, "%v %v %v %v %v", caclulateASCII(slm, "\n"), slm, slm.zeitpunkte[0:], slm.Width%2, len(slm.zeitpunkte))
}

// SampleHandlerHTMLImg may be used with a browser to test the package.
func SampleHandlerHTMLImg(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	slm := NewStatic(720, time.Now().Local())
	//slm.Now()
	bar := mergeImages2(slm)
	html := "<html><body><img src='data:image/png;base64," + bar + "' /><p>"
	fmt.Fprintf(w, "%v %v", html, slm)
}
*/

//func main() {
//}

//author Peter Hellberg
func timeDayFraction(timestamp time.Time) float64 {
	_, timezoneOffset := timestamp.Zone()

	t := float64(timestamp.Hour()) + (float64(timestamp.Minute()) / 60) + (float64(timestamp.Second()) / 3600)

	t = (t + float64(24) + float64(6) - (float64(timezoneOffset) / float64(3600)))

	for t > 24 {
		t = t - 24
	}

	return t / 24
}

// drawASCII print to stdout
func drawASCII(text string) {
	io.Copy(os.Stdout, strings.NewReader(text))
}

// caclulateASCII returns a string
func caclulateASCII(slm *sunlightlib, seperator string) string {

	retval := ""

	for _, value := range slm.zeitpunkte {

		sslm := newSingle(slm, value)

		for v := 0; v < slm.Height; v++ {
			for u := 0; u < slm.Width; u++ {

				phi := ((float64(v) / (float64(slm.Height) * float64(2))) - 1) * (2 * math.Pi)
				theta := (float64(u) / float64(slm.Width)) * (2 * math.Pi)

				earthNormal := vec3{
					math.Sin(phi) * math.Cos(theta),
					math.Cos(phi),
					math.Sin(phi) * math.Sin(theta),
				}

				earthNormal.normalize(1)

				angleBetweenSurfaceAndSunlight := sslm.pointingFromEarthToSun.dot(earthNormal)

				switch {
				case angleBetweenSurfaceAndSunlight <= -0.1:
					retval = retval + "\u2588\u2588"
				case angleBetweenSurfaceAndSunlight < 0.1:
					retval = retval + "\u2592\u2592"
				case angleBetweenSurfaceAndSunlight > 0.97:
					retval = retval + "\u2591\u2591"
				default:
					retval = retval + "\u2592\u2592"
				}
			}
			retval = retval + seperator
		}

		//retval = retval + string(value.Local()) + "\n"
	}
	//fmt.Println(retval)
	return retval
	//return strings.NewReader(retval)
}

// getBaseImage tries all it can to return some image.
// if the supplied filename is not found from the path calling the sunlightlib package
// then a colored emtpy image is returned.
// This way the merge functionality does have valid input to work on.
// The returned *image.RGBA of makeEmptyColoredImage gets converted to image.Image?!?
func getBaseImage(slm *sunlightlib, variant string, filename string) (retimg image.Image) {
	color := dayFallbackColor
	if variant == "night" {
		color = nightFallbackColor
	}
	myFile, err := os.Open(filename)
	if err != nil {
		//panic(err)
		retimg = makeEmptyColoredImage(slm.Width, slm.Height, color)
	} else {
		defer myFile.Close()
		retimg, _, err = image.Decode(myFile)
		if err != nil {
			retimg = makeEmptyColoredImage(slm.Width, slm.Height, color)
		}
	}
	return
}

// ReturnStaticPngBase64 is called with a sunlightlib struct and
// returns a base64 encoded string of a single sunlightlib in png format.
func ReturnStaticPngBase64(slm *sunlightlib) (retval string, err error) {

	buff := bytes.Buffer{}
	slm.visualization = "static"
	//for _, value := range slm.zeitpunkte {

	sslm := newSingle(slm, slm.zeitpunkte[0])
	img, err := mergeImages2(slm, &sslm)
	if err != nil {
		panic(err) //fixme
	}
	png.Encode(&buff, img)
	retval = base64.StdEncoding.EncodeToString(buff.Bytes())
	return

}

/* // SampleHandlerTest may be used with a browser to test the package.
func SampleHandlerTest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	datetimerange2 := []time.Time{
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, -5, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, -4, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, -3, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, -2, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, -1, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, 1, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, 2, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, 3, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, 4, 1),
		time.Date(2017, 10, 21, 17, 30, 0, 0, time.UTC).AddDate(0, 5, 1),
		time.Date(2017, 10, 24, 17, 30, 0, 0, time.UTC).AddDate(0, 6, 1),
	}
	_ = datetimerange2
	slm := New(720, "animated", datetimerange2)
	bar := Test(&slm)
	html := "<html><body><img src='data:image/gif;base64," + bar + "' /><p>"
	fmt.Fprintf(w, "%v %v", html, slm)
}

func Test(slm *sunlightlib) (retval string) {

	buff := bytes.Buffer{}
	outGif := &gif.GIF{}

	for i := range slm.zeitpunkte {
		baz := foo(i)
		sslm := newSingle(slm, slm.zeitpunkte[i])
		img, err := mergeImages2(slm, &sslm)
		if err != nil {
			panic(err)
		}
		slm.debugstring += baz + ","
		slm.debugstring += strconv.Itoa(sslm.width) + ", "
		slm.debugstring += sslm.datetime.String()
		slm.debugstring += "; "
		_ = i
		//png.Encode(&buff, img)
		bounds := img.Bounds()
		palettedImage := image.NewPaletted(bounds, palette.Plan9)
		//palettedImage.Palette = draw.Quantizer.Quantize(make(color.Palette, 0, 256), img)
		draw.Draw(palettedImage, palettedImage.Rect, img, bounds.Min, draw.Over)
		outGif.Image = append(outGif.Image, palettedImage)
		outGif.Delay = append(outGif.Delay, 64)
	}

	// f, err := os.OpenFile("out.gif", os.O_WRONLY|os.O_CREATE, 0600)
	//if err != nil {
	//	panic(err)
	//}
	//defer f.Close()

	gif.EncodeAll(&buff, outGif)

	retval = base64.StdEncoding.EncodeToString(buff.Bytes())

	return
}

func foo(i int) string {
	return strconv.Itoa(i)
}
*/

// mergeImages2 returns 2 merged images
func mergeImages2(slm *sunlightlib, sslm *singleSunlightlib) (returnedImage *image.RGBA, err error) {

	dayImage := getBaseImage(slm, "day", slm.DaylightImageFilename)
	nightImage := getBaseImage(slm, "night", slm.NighttimeImageFilename)

	// The dimensions of the day image are the leading dimensions.
	// They are used to automagically correct wrong user input.
	// The result may not be what is expected but at least a call to action.
	if dayImage.Bounds().Max.X < slm.Width {
		slm.Width = dayImage.Bounds().Max.X
	}
	if dayImage.Bounds().Max.Y < slm.Height {
		slm.Height = dayImage.Bounds().Max.Y
	}

	returnedImage = image.NewRGBA(image.Rect(0, 0, slm.Width, slm.Height))

	for v := 0; v < slm.Height; v++ {
		for u := 0; u < slm.Width; u++ {

			phi := ((float64(v) / (float64(slm.Height) * float64(2))) - 1) * (2 * math.Pi)
			theta := (float64(u) / float64(slm.Width)) * (2 * math.Pi)

			// This was the biggest obstacle when porting the original PHP code:
			// The sequence there was $y $x $z
			earthNormal := vec3{
				math.Sin(phi) * math.Cos(theta),
				math.Cos(phi),
				math.Sin(phi) * math.Sin(theta),
			}
			earthNormal.normalize(1)

			angleBetweenSurfaceAndSunlight := sslm.pointingFromEarthToSun.dot(earthNormal)

			switch {
			case angleBetweenSurfaceAndSunlight <= -0.1:
				returnedImage.Set(u, v, nightImage.At(u, v))
			case angleBetweenSurfaceAndSunlight < 0.1:
				returnedImage.Set(u, v, rgbasum(
					dayImage.At(u, v),
					nightImage.At(u, v),
					(angleBetweenSurfaceAndSunlight+0.1)*4.9, //<0.1+0.1*almost5 equals <100% (*5.0 brings artefacts)
				))
			case angleBetweenSurfaceAndSunlight > 0.97:
				returnedImage.Set(u, v, dayImage.At(u, v))
			default:
				returnedImage.Set(u, v, dayImage.At(u, v))
			}
		}
	}
	return
}

// makeEmptyColoredImage is a helper function used when working with files fails.
func makeEmptyColoredImage(width, height int, color color.RGBA) *image.RGBA {
	returnImage := image.NewRGBA(image.Rect(0, 0, width, height))
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			returnImage.Set(x, y, color)
		}
	}
	return returnImage
}

// rgbasum blends two RGBA colors which is not ideal but sufficient for this usecase.
// does not work well if the same colors are supplied
// quantifier should remain slightly below "100%"
// TODO(cpr): alpha blending
func rgbasum(colorDay, colorNight color.Color, quantifier float64) color.RGBA {
	cDr, cDg, cDb, cDa := colorDay.RGBA()
	cNr, cNg, cNb, cNa := colorNight.RGBA()

	//https://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
	a := cDa + cNa*(1-cDa)
	r := (float64(cDr)*quantifier + (float64(cNr) * (1 - quantifier)))
	g := (float64(cDg)*quantifier + (float64(cNg) * (1 - quantifier)))
	b := (float64(cDb)*quantifier + (float64(cNb) * (1 - quantifier)))

	//todo: alpha blending
	//https://jimdoescode.github.io/2015/05/22/manipulating-colors-in-go.html
	return color.RGBA{uint8(r / 0x101), uint8(g / 0x101), uint8(b / 0x101), uint8(a / 0x101)}
}
