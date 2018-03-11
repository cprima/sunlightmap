GOPATH=$(CURDIR)

.PHONY: all
all: clean test build

myvendor:
	cp -Rf src/sunlightmap vendor/

.PHONY: clean
clean:
	go clean
	rm -f backend

test:
	go test -v sunlightmap

build:
	GOOS=linux GOARCH=amd64 go build -o backend main.go backend.go
	#GOARCH=386

#Deploy
bluemix-dev: myvendor
	cf api api.eu-gb.bluemix.net
	#cf login
	cf target -o cprior@gmail.com -s sunlightmap
	cf push sunlightmap-dev -f manifest.yml

bluemix-prod: myvendor
	cf api api.eu-gb.bluemix.net
	#cf login
	cf target -o cprior@gmail.com -s sunlightmap
	cf push sunlightmap-prod -f manifest.yml

gae-local:
	dev_appserver.py app.yaml

gae-dev:
	#~/.config/gcloud/configurations/config_sunlightmapdev
	#[core]
	#account = cprior@gmail.com
	#project = sunlightmapdev
	#disable_usage_reporting = True
	#
	#[compute]
	#zone = europe-west3-b
	#region = europe-west3
	#
	#[app]
	#promote_by_default = true
	#
	gcloud config configurations activate sunlightmapdev
	# gcloud config set project sunlightmapdev
	# https://cloud.google.com/sdk/gcloud/reference/app/deploy
	GOPATH=$(GOPATH) gcloud app deploy app.yaml --stop-previous-version --quiet #--verbosity=info #--no-promote
	#
	#https://console.cloud.google.com/appengine/versions?project=sunlightmapdev
	#