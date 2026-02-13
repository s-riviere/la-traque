---
lang: en-GB
---

# Set up mobile

This tutorial will help you to set up your development environment, use a dev build and create an APK.

## Table of Contents
* [Environment](#environment) : Dependencies, packages, app key and device
* [Dev build](#dev-build) : Create, install and use
* [APK](#apk) : Create and install

## Environment

### Installing dependencies and preparing the device

You will need to install Android Studio, some SDKs and prepare your device if you want to use a physical one. Follow this [tutorial](https://reactnative.dev/docs/set-up-your-environment?os=linux&platform=android).

Note : if you want to use a physical android device, you just have to follow the first part of the tutorial. You may also enable install via USB depending on your device.

### Installing packages and create the android folder

Go in the `traque-app` folder and run `npm i` to intall the packages of the project.

Then run `npx expo prebuild --platform android` to create the android folder needed to create a dev build or an apk.

In order to prevent an issue, go to the `android/build.gradle` file and replace the line `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')` by `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')`.

In order to be able to have a dev build and an apk on the same device, go to the `android/app/build.gradle` file and add :

```txt
android {
    ...
    buildTypes {
        debug {
            ...
            applicationIdSuffix ".debug"
            versionNameSuffix "-debug"
        }
        ...
    }
    ...
}
```

### App key

An app key is like a signature of the application and is required by google play store. Therefore, you can skip this part if you don't plan to publish your modifications on the Google Playstore.

#### Create the app key

An app cannot have more than one key associated to it. If a key have already been generated for this project, please contact the creator of the key and follow to the next section.

Go in the `traque-app/android/app/` folder and run `keytool -genkey -v -keystore release.keystore -alias traque_key -keyalg RSA -keysize 2048 -validity 10000`.

Note : `release` and `traque_key` can be modified if you want.

#### Add the app key

Put the `.keystore` file associated with your app into `traque-app/android/app/` and then modify the android bracket of the `traque-app/android/app/build.gradle` file as follows :

```txt
android {
    ...
    signingConfigs {
        ...
        release {
            storeFile file('TO_BE_FILLED.keystore')
            storePassword 'TO_BE_FILLED'
            keyAlias 'TO_BE_FILLED'
            keyPassword 'TO_BE_FILLED'
        }
    }
    buildTypes {
        ...
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
    ...
}
```

## Dev build

A development build (or dev build) is an application that can be installed on you device, that connects to a development server and that allow you to see the modifications instantly.

### Build and install the dev build

Here you need to connect your device to your computer with a USB cable.

Go in the `traque-app` folder and run `npx expo run:android` in order to build the app and send it on your device.

### Use the dev build

Here you can work over USB or over the wifi.

Go in the `traque-app` folder and run `npm start` to start the development server. Verify that a blue *development build* appears in your terminal. Then scan the QR code that appears with your android device.

Note : if the app crashes, you may need to restart the development server.


## APK

An apk is an application that can be installed on an android device without the need of google play store. It is a definitive version of your application that can't be modified after being built.

### Build the APK

Go in the `traque-app/android/` folder and run `./gradlew assembleRelease`. At the end, the created apk will be located in the `app/build/outputs/apk/release/` folder.

Note : if the build fail you may try to delete and recreate `node_modules/` or `android/`, you may also try to delete the `~/.gradle/caches/` folder.

### Install the APK

Simply share the APK with a drive and click on the APK file on your device to install it.
