

export ANDROID_HOME=/opt/Android/Sdk
export PATH := $(ANDROID_HOME):$(ANDROID_HOME)/tools:$(ANDROID_HOME)/platform-tools:$(PATH)


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

.PHONY: build-android-prod
build-android-prod:
	ionic cordova build android --prod --release
	echo "G. (2018)"
	jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore slm-release-key.jks platforms/android/build/outputs/apk/release/android-release-unsigned.apk slm
	$(ANDROID_HOME)/build-tools/27.0.3/zipalign -f -v 4 platforms/android/build/outputs/apk/release/android-release-unsigned.apk slm.apk

