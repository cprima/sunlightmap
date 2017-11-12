> .
> work in progress
>

Google Cloud Console golang backend.

{% if jekyll.environment != "development" %}
[![GoDoc](https://godoc.org/github.com/cprior/sunlightmap_app/application/physical/backend?status.svg)](https://godoc.org/github.com/cprior/sunlightmap_app/application/physical/backend)
{% endif %}


## Gettings started

This code answers HTTP POST requests with a Content-Type of application/json so besides a Go compiler some means to issue POST requests is needed, e.g. with curl.

### Prerequisites



### Installing


## Running the tests

An installation of Go includes a test tool run with `go test`. Inside the backend folder of this repository some basic unit tests are included.

```bash
$ cd ./application/physical/backend
$ go test -v
=== RUN   TestNew_odd
--- PASS: TestNew_odd (0.00s)
=== RUN   TestReturnStaticBase64
--- PASS: TestReturnStaticBase64 (0.20s)
=== RUN   TestCaclulateASCII
--- PASS: TestCaclulateASCII (0.00s)
=== RUN   ExampleNewStatic
--- PASS: ExampleNewStatic (0.00s)
=== RUN   ExampleReturnStaticPngBase64
--- PASS: ExampleReturnStaticPngBase64 (0.21s)
PASS
ok      ./application/physical/backend   0.424s
```

## Deployment


`gcloud deploy`

## Built With

go1.9.2 linux/amd6

## Versioning

GitHub tags, gcloud versions

## Authors

Christian Prior-Mamulyan

## License

Copyright (c) 2017 Christian Prior-Mamulyan
Use of this source code is governed by the MIT license that can be found in the LICENSE file in the root folder of the repository.

## Acknowledgements

Without my wife there had never been a need to visualize the effect several thousand kilometers/miles of east-west distance.

Many thanks to the unknown webmaster of the People's Observatory Berlin who explained basic astronomical math to me two decades ago. This made me realize such things can be set in code.

The implementation is a port of PHP code by Copyright (c) 2009, J.P.Westerhof <jurgen.westerhof@gmail.com>, available at http://www.edesign.nl/2009/05/14/math-behind-a-world-sunlight-map/ .
