#!/usr/bin/env bash

#. ../setandroidpaths

#vim config.xml
ionic cordova build android --prod --release


#keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks platforms/android/build/outputs/apk/android-release-unsigned.apk my-alias

rm slm.apk
/opt/Android/Sdk/build-tools/26.0.1/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk slm.apk

/opt/Android/Sdk/build-tools/26.0.1/apksigner verify slm.apk

echo "https://play.google.com/apps/publish/?account=7862198326844882807#AppListPlace"