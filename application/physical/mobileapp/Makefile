
ANDROID_HOME=/opt/Android/Sdk


all: checkpath adb
	echo $(PATH)

.PHONY: checkpath
checkpath:
	@type gradle >/dev/null 2>&1 || export PATH=/opt/gradle/gradle-4.5.1/bin:"$(PATH)"

.PHONY: adb
adb:
	sudo adb kill-server
	sudo adb start-server
	adb devices

.PHONY: build-android
build-android:
	ionic cordova build android --prod --release
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks platforms/android/build/outputs/apk/release/android-release-unsigned.apk my-alias
	rm slm.apk
	/opt/Android/Sdk/build-tools/27.0.3/zipalign -v 4 platforms/android/build/outputs/apk/release/android-release-unsigned.apk slm.apk
