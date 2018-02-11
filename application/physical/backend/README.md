# Backend code #

TL;DR: Symlink from $GOPATH/src/backend and $GOPATH/src/sunlightmap

{% if jekyll.environment != "development" %}
[![GoDoc](https://godoc.org/github.com/cprior/sunlightmap/application/physical/backend?status.svg)](https://godoc.org/github.com/cprior/sunlightmap/application/physical/backend)
{% endif %}

Directory with the backend code, ready for

- several cloud provider
  - IBM Bluemix
  - Google App Engine
- local tests

## Getting started with Cloud Providers ##

This code answers HTTP POST requests with a Content-Type of application/json so besides a Go compiler some means to issue POST requests is needed, e.g. with curl.

### Google Apps Engine ###

ToDo: install the sdk

Information about the terms and conditions of the free trial at [console.cloud.google.com/freetrial](https://console.cloud.google.com/freetrial).

Go to [console.cloud.google.com/projectselector/home/dashboard](https://console.cloud.google.com/projectselector/home/dashboard) and login with a Google account.

Via the dropdown link "Select a project" and the button with a + sign a new project can be created. The free trial version allows for 10 projects.

With the newly created projectd selected, go via the menu icon "Products and services" to "App Engine".

Now it is best to switch to the command line tool.

The `gcloud` cli program stores configuration files in `~/.config/gcloud/configurations/config_foobar`, these can be activated with `gcloud config configurations activate foobar`. Creating and other changes to these files is described at [cloud.google.com/.../configurations/](https://cloud.google.com/sdk/gcloud/reference/config/configurations/). The first such file is created by `gcloud init`.

With `gcloud auth login` the default browser opens and oauth permissions are being granted to "Google Cloud SDK" in the process. On a windowless system a URL is displayed that must be accessed by any browser to get a verification code.

With `gcloud config set project PROJECT_ID` the project (from the dropdown list in the [console.cloud.google.com](https://console.cloud.google.com)) is set and written to the active configuration file.

Then a App Engine app must be created, in the desired region, e.g. with `gcloud app create --region europe-west3`. A list of the available regions is displayed with gcloud app regions list.

From now on commands like `gcloud app deploy app.yaml --stop-previous-version --quiet --verbosity=info` should work.

Additional quickstart documentation for Go applications is available at [cloud.google.com/appengine/.../go/quickstart](https://cloud.google.com/appengine/docs/standard/go/quickstart).

### IBM Bluemix ###

Information about the terms and conditions of the free trial at [ibm.com/cloud/pricing](https://www.ibm.com/cloud/pricing). The registration at [console.ng.bluemix.net/registration/](https://console.ng.bluemix.net/registration/) will send an email to confirm the account.

Go to [console.bluemix.net/dashboard/apps](https://console.bluemix.net/dashboard/apps) and login with a IBM / Bluemix account.

ToDo: Check "space" creation.

Via "Create resource" and a search for "label:lite go" a "Cloud Foundry Apps" for "Go" can be created, to "Develop, deploy, and scale Go web apps with ease." Entering "App name", "Host name" and chosing the Lite plan with 64MB is sufficient for the backend app in this repository.

Now it is best to switch to the command line tool. Before the login the regio must be selected.

```bash
cf api api.eu-gb.bluemix.net
cf login
cf target sunlightmap-dev
```

In case there are errors like "No org targeted, use 'cf target -o ORG' to target an org." check [https://console.bluemix.net/dashboard/apps](https://console.bluemix.net/dashboard/apps) if the "Region" matches the `cf api $url`.

Then all is ready for a `cf push`.

#### Transcript ####

```bash
cpr@T530-2017:~/tmp/sunlightmap$ cf api api.eu-gb.bluemix.net
Setting api endpoint to api.eu-gb.bluemix.net...
OK

api endpoint:   https://api.eu-gb.bluemix.net
api version:    2.92.0
Not logged in. Use 'cf login' to log in.
cpr@T530-2017:~/tmp/sunlightmap$ cf login
API endpoint: https://api.eu-gb.bluemix.net

Email> cprior@gmail.com

Password>
Authenticating...
OK

Targeted org cprior@gmail.com

Targeted space sunlightmap



API endpoint:   https://api.eu-gb.bluemix.net (API version: 2.92.0)
User:           cprior@gmail.com
Org:            cprior@gmail.com
Space:          sunlightmap

```

Additional quickstart documentation for Go applications is available at [console.bluemix.net/.../go/getting-started.html](https://console.bluemix.net/docs/runtimes/go/getting-started.html#getting-started-tutorial) and [console.bluemix.net/.../#runtimes/go/](https://console.bluemix.net/docs/#runtimes/go/index.html).

## Testing ##

Some Go tests with rudimentary code coverage areincluded, and the configuration of the GAE Google App Engine can also be tested locally.

### Go test ##

An installation of Go includes a test tool run with `go test`. Inside the sunlightmap folder of this repository some basic unit tests are included.

```bash
$ cd ./application/physical/backend/src/sunlightmap
$ go test -v
=== RUN   TestNew_odd
--- PASS: TestNew_odd (0.00s)
=== RUN   TestReturnStaticBase64
--- PASS: TestReturnStaticBase64 (0.22s)
=== RUN   TestCaclulateASCII
--- PASS: TestCaclulateASCII (0.00s)
=== RUN   ExampleNewStatic
--- PASS: ExampleNewStatic (0.00s)
=== RUN   ExampleReturnStaticPngBase64
--- PASS: ExampleReturnStaticPngBase64 (0.25s)
PASS
ok      _/home/cpr/cprior/sunlightmap/application/physical/backend/src/sunlightmap      0.473s
```

### GAE: Test locally ###

The Google Cloud SDK contains a Python script dev_appserver.py that mimicks the GAE environment.

```bash
GOPATH=$(pwd) dev_appserver.py app.yaml
```

### Serving locally ###

The Ionic 3 app in this repo has a switch to detect the platform and request from localhost or the backend server:

```javascript
    //caveat: Device toolbar in Chrome makes platform 'android' or 'ios'!
    let url = 'http://localhost:8080/v2/test'
    if (this.platform.is('android') || this.platform.is('ios')) {
      url = 'http://sunlightmap.appspot.com/v2/test';
    }
```

It is not the Go way to manipulate `$GOPATH` but this eases deployment to GAE Google Apps Engine a bit.

Building the Go package will serve requests locally on port 8080, listening on any interface:

```bash
cd application/physical/backend
GOPATH=$(pwd) go build -o backend main.go backend.go
./backend
#PORT=8081 GOPATH=$(pwd) go run main.go backend.go
```

The default port ist 8080 but can be changed with an environment variable.

During development, a poor man's livereload can be achieved with

```bash
while true; do go run main.go backend.go &  myPID=$! ; inotifywait -e modify main.go ; kill $myPID; killall main; done
```

Whatever method to serve the backend locally is used, the mobile app JavaScript switch should trigger and allow for local testing of the mobile app, too: No deployed backend needed.

### Testing ToDo ###

Some automated GUI test for the backend response, e.g. with an additional handler.

## Build and Deployment ##

The Go code should work with any Go version higher than 1.6 and due to the differing environments "in the cloud" it will be run with their respective versions. This just to keep in mind -- and deployment to some pre-production setup  is advisable.

### Setting GOPATH ###

To make a long story short: This repository is of the "one repo holds all" which goes against the Go grain and many tools have the convention `$GOPATH/src/foobar` hardcoded. This repo may not work without symlinks

- from `~/go/src/backend` to `application/physical/backend`
- from `~/go/src/sunlightmap` to `application/physical/backend/src/sunlightmap`

Deviation from this could work, but might also lead into several rabbit holes.

### Versioning ###

ToDo: GitHub tags, gcloud versions

### Bluemix: deploy ###

The configuration for the IBM Bluemix "Cloud Foundry Apps" is done in "manifest.yml" files. Docu is available at [ocs.cloudfoundry.org/.../deploy-apps/manifest.html](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html). The configuration for several apps can be inside.

manifest.yml

```yaml
---
  applications:
    - name: sunlightmap-dev
      memory: 32M
...

    - name: sunlightmap-prod
      memory: 16M
...
```

On the commandline the mainfest file can be explicitly supplied, or `manifest.yml` is used as default. The parameter APP_NAME of `cf` then selects from the configuration, the following will apply the 16M memory setting:

```bash
cf push sunlightmap-prod -f manifest.yml
```

To always use th latest Go build setup a "buildpack" should be supplied, e.g. with `buildpack: https://github.com/cloudfoundry/go-buildpack.git` in the config file, or `-b` on the commandline.

These buildpacks can be customized. Many are available as community-supplied contributions.

### GAE: deploy ###

With the appropriate configuration activated, as described above in "Getting started", a cautious deployment is done with `gcloud app deploy`, documented at [cloud.google.com/.../app/deploy](https://cloud.google.com/sdk/gcloud/reference/app/deploy):

```bash
gcloud app deploy app.yaml --no-promote --no-stop-previous-version --quiet --verbosity=info
```

This prevents any default traffic to be served from this version, but the App Engine Dashboard under "Versions" gives direct links to the app[console.cloud.google.com/appengine/versions](https://console.cloud.google.com/appengine/versions). A link is also printedat the end of the commend line output:

#### Transcript of gcloud app deploy ####

```bash
cpr@localhost:~/projects/sunlightmap/application/physical/backend$ GOPATH=$(pwd) gcloud app deploy app.yaml --stop-previous-version --quiet --verbosity=info
WARNING: The "module" parameter in application .yaml files is deprecated. Please use the "service" parameterinstead.
INFO: Executing staging command: [/home/user/google-cloud-sdk/platform/google_appengine/go-app-stager /home/user/projects/sunlightmap/application/physical/backend/app.yaml /home/user/projects/sunlightmap/application/physical/backend /tmp/tmpVzCcXP/tmpK8qBio]


INFO: ------------------------------------ STDOUT ------------------------------------
------------------------------------ STDERR ------------------------------------
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap_test.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap_test.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/vec.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/vec.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap_test.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap_test.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/vec.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/vec.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap_test.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap_test.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/vec.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/vec.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap_test.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/sunlightmap_test.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/vec.go to /tmp/tmpVzCcXP/tmpK8qBio/sunlightmap/vec.go
copied /home/user/projects/sunlightmap/application/physical/backend/.cfignore to /tmp/tmpVzCcXP/tmpK8qBio/.cfignore
copied /home/user/projects/sunlightmap/application/physical/backend/.gcloudignore to /tmp/tmpVzCcXP/tmpK8qBio/.gcloudignore
copied /home/user/projects/sunlightmap/application/physical/backend/Makefile to /tmp/tmpVzCcXP/tmpK8qBio/Makefile
copied /home/user/projects/sunlightmap/application/physical/backend/README.md to /tmp/tmpVzCcXP/tmpK8qBio/README.md
copied /home/user/projects/sunlightmap/application/physical/backend/app.yaml to /tmp/tmpVzCcXP/tmpK8qBio/app.yaml
copied /home/user/projects/sunlightmap/application/physical/backend/backend to /tmp/tmpVzCcXP/tmpK8qBio/backend
copied /home/user/projects/sunlightmap/application/physical/backend/backend.go to /tmp/tmpVzCcXP/tmpK8qBio/backend.go
copied /home/user/projects/sunlightmap/application/physical/backend/index.md to /tmp/tmpVzCcXP/tmpK8qBio/index.md
copied /home/user/projects/sunlightmap/application/physical/backend/main.go to /tmp/tmpVzCcXP/tmpK8qBio/main.go
copied /home/user/projects/sunlightmap/application/physical/backend/manifest.yml to /tmp/tmpVzCcXP/tmpK8qBio/manifest.yml
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap.go to /tmp/tmpVzCcXP/tmpK8qBio/src/sunlightmap/sunlightmap.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/sunlightmap_test.go to /tmp/tmpVzCcXP/tmpK8qBio/src/sunlightmap/sunlightmap_test.go
copied /home/user/projects/sunlightmap/application/physical/backend/src/sunlightmap/vec.go to /tmp/tmpVzCcXP/tmpK8qBio/src/sunlightmap/vec.go
copied /home/user/projects/sunlightmap/application/physical/backend/vendor/.gitignore to /tmp/tmpVzCcXP/tmpK8qBio/vendor/.gitignore
copied /home/user/projects/sunlightmap/application/physical/backend/vendor/sunlightmap/sunlightmap.go to /tmp/tmpVzCcXP/tmpK8qBio/vendor/sunlightmap/sunlightmap.go
copied /home/user/projects/sunlightmap/application/physical/backend/vendor/sunlightmap/sunlightmap_test.go to /tmp/tmpVzCcXP/tmpK8qBio/vendor/sunlightmap/sunlightmap_test.go
copied /home/user/projects/sunlightmap/application/physical/backend/vendor/sunlightmap/vec.go to /tmp/tmpVzCcXP/tmpK8qBio/vendor/sunlightmap/vec.go
copied /home/user/projects/sunlightmap/application/physical/backend/world_mine_day_solarized_720-360_fixme-compressor.png to /tmp/tmpVzCcXP/tmpK8qBio/world_mine_day_solarized_720-360_fixme-compressor.png
copied /home/user/projects/sunlightmap/application/physical/backend/world_mine_night_solarized_720-360_fixme-compressor.png to /tmp/tmpVzCcXP/tmpK8qBio/world_mine_night_solarized_720-360_fixme-compressor.png
--------------------------------------------------------------------------------

Services to deploy:

descriptor:      [/home/user/projects/sunlightmap/application/physical/backend/app.yaml]
source:          [/home/user/projects/sunlightmap/application/physical/backend]
target project:  [sunlightmap-dev]
target service:  [default]
target version:  [20180211t092918]
target url:      [https://sunlightmap-dev.appspot.com]


Beginning deployment of service [default]...
INFO: Ignoring file [.cfignore]: File matches ignore regex.
INFO: Ignoring file [Makefile]: File matches ignore regex.
INFO: Ignoring file [README.md]: File matches ignore regex.
INFO: Ignoring file [backend]: File matches ignore regex.
INFO: Ignoring file [index.md]: File matches ignore regex.
INFO: Ignoring file [main.go]: File matches ignore regex.
INFO: Ignoring file [manifest.yml]: File matches ignore regex.
INFO: Ignoring file [vendor/.gitignore]: File matches ignore regex.
INFO: Ignoring directory [vendor/sunlightmap]: Directory matches ignore regex.
Some files were skipped. Pass `--verbosity=info` to see which ones.
You may also view the gcloud log file, found at
[/home/user/.config/gcloud/logs/2018.02.11/09.29.16.974132.log].
INFO: Could not find any remote repositories associated with [/tmp/tmpVzCcXP/tmpK8qBio]. Cloud diagnostic tools may not be able to display the correct source code for this deployment.
INFO: Incremental upload skipped 100.0% of data
╔════════════════════════════════════════════════════════════╗
╠═ Uploading 0 files to Google Cloud Storage                ═╣
╚════════════════════════════════════════════════════════════╝
File upload done.
INFO: Manifest: [{'src/sunlightmap/sunlightmap_test.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/f5f64e6f997bc9c4cb5c63bb880b5e2a4937a4ff', 'sha1Sum': 'f5f64e6f997bc9c4cb5c63bb880b5e2a4937a4ff'}, 'sunlightmap/sunlightmap.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/4c9fff8f9089031c83ee106c2c1393e0c18502df', 'sha1Sum': '4c9fff8f9089031c83ee106c2c1393e0c18502df'}, 'sunlightmap/sunlightmap_test.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/f5f64e6f997bc9c4cb5c63bb880b5e2a4937a4ff', 'sha1Sum': 'f5f64e6f997bc9c4cb5c63bb880b5e2a4937a4ff'}, 'world_mine_night_solarized_720-360_fixme-compressor.png': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/5a8509418841c50e7f02a4fd7650669b3cb03ed4', 'sha1Sum': '5a8509418841c50e7f02a4fd7650669b3cb03ed4'}, 'src/sunlightmap/sunlightmap.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/4c9fff8f9089031c83ee106c2c1393e0c18502df', 'sha1Sum': '4c9fff8f9089031c83ee106c2c1393e0c18502df'}, 'sunlightmap/vec.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/9648340c74c5a076de677d6d63aaf226dad6d2fa', 'sha1Sum': '9648340c74c5a076de677d6d63aaf226dad6d2fa'}, 'app.yaml': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/783b887ad7831dbefc1d91a6a8f29c39e364e11f', 'sha1Sum': '783b887ad7831dbefc1d91a6a8f29c39e364e11f'}, 'backend.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/e5b0c340b6fa780a22e4a85a5691faa8da2cdf10', 'sha1Sum': 'e5b0c340b6fa780a22e4a85a5691faa8da2cdf10'}, '.gcloudignore': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/0792af1fa7ac2c93ddb7d6e61fb3c0c6686f9af6','sha1Sum': '0792af1fa7ac2c93ddb7d6e61fb3c0c6686f9af6'}, 'src/sunlightmap/vec.go': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/9648340c74c5a076de677d6d63aaf226dad6d2fa', 'sha1Sum':'9648340c74c5a076de677d6d63aaf226dad6d2fa'}, 'world_mine_day_solarized_720-360_fixme-compressor.png': {'sourceUrl': 'https://storage.googleapis.com/staging.sunlightmap-dev.appspot.com/61c462343a25d7a964b7ef11f7b08a9d04ae518e', 'sha1Sum': '61c462343a25d7a964b7ef11f7b08a9d04ae518e'}}]
Updating service [default]...done.
Waiting for operation [apps/sunlightmap-dev/operations/38984365-f195-48a2-91ea-12c92ac7578d] to complete...done.
Updating service [default]...|INFO: Previous default version [sunlightmap-dev/default/20180211t092144] is anautomatically scaled standard environment app, so not stopping it.
Updating service [default]...done.
Deployed service [default] to [https://sunlightmap-dev.appspot.com]

You can stream logs from the command line by running:
  $ gcloud app logs tail -s default

To view your application in the web browser run:
  $ gcloud app browse
INFO: Display format "none".
```

## Release ##

The URLs must match

- in the Go code of the backend package
- in the app.yaml file the handler must be Go
- and of course the mobile app needs to call the correct backend

## Operate ##

ToDo

## Authors ##

Christian Prior-Mamulyan

## License ##

Copyright (c) 2017-2018 Christian Prior-Mamulyan
Use of this source code is governed by the MIT license that can be found in the LICENSE file in the root folder of the repository.

## Acknowledgements ##

Without my wife there had never been a need to visualize the effect several thousand kilometers/miles of east-west distance.

Many thanks to the unknown webmaster of the People's Observatory Berlin who explained basic astronomical math to me two decades ago. This made me realize such things can be set in code.

The implementation is a port of PHP code by Copyright (c) 2009, J.P.Westerhof <jurgen.westerhof@gmail.com>, available at [http://www.edesign.nl/2009/05/14/math-behind-a-world-sunlight-map/](http://www.edesign.nl/2009/05/14/math-behind-a-world-sunlight-map/) .
