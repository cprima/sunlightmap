#!/usr/bin/env bash

curl --silent --write-out %{http_code} --location -z testdata/physical_ne_10m_land.zip.timestamp.txt -o testdata/physical_ne_10m_land.zip http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_land.zip
touch testdata/physical_ne_10m_land.zip.timestamp.txt
unzip -q -u -o testdata/physical_ne_10m_land.zip -d testdata/land

#http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_ocean.zip
curl --silent --write-out %{http_code} --location -z testdata/physical_ne_10m_ocean.zip.timestamp.txt -o testdata/physical_ne_10m_ocean.zip http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_ocean.zip
touch testdata/physical_ne_10m_ocean.zip.timestamp.txt
unzip -q -u -o testdata/physical_ne_10m_ocean.zip -d testdata/ocean


if [ -f "./testdata/profiles/testing/qgis.db" ]; then rm "./testdata/profiles/testing/qgis.db" ; fi
mkdir -o ./testdata/profiles/testing/
cp ./testdata/profiles/orig/qgis.db ./testdata/profiles/testing/
