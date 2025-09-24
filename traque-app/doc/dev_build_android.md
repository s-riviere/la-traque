# How to create a local developpement build with Expo

Expo go is great to start a React Native project with Expo but reaches its limits when background localisation or server notifications have to be implemented and tested. This tutorial will explain the steps to create the debug android app of the current project (ie developpement build) and download it on an android device. A similar process can be done to test the IOS app but it requires a Mac so this won't be covered in this tutorial. A virtual android device can be created with Android Studio (explained later) but the process to send the app on the virtual device isn't covered in this tutorial. Here is a link that may help you : https://youtu.be/cs-zgHjt5RQ?si=Fzxik7zreek07uC0. Each step has precisions, however some of those precisions may not be suited for your device, don't hesitate to find help on the Internet or ask ChapGPT.



## Set up your environnement

This section will cover the set up of your environnement in order to have the tools to either send the apk of your app on your device or create a virtual android device.

### Tutorial

Follow this tutorial : https://reactnative.dev/docs/set-up-your-environment?os=linux&platform=android

### Precisions

* The `.bashrc` file is located in your home directory (`cd ~`).
* The Watchman installation isn't necessary.
* If you want to test your app on a physical android device, follow the next section.



## Set up your physical android device

This section will cover the actions to perform on your device to be able to download the apk of the app.

### Tutorial

Follow the first section of this tutorial : https://reactnative.dev/docs/running-on-device?os=linux&platform=android

### Precisions

* In some devices, you may also enable the *install via USB* option.
* When your device is connected, keep in your mind that a pop up asking authorizations can appear on it.



## Build the native app

This section will cover the building of the app and the sending on your device.

### Tutorial

* Go in your project folder (`traque-app`).
* Run `npm i`
* Run `npx expo prebuild --platform android`
* Connect your device to your computer with a USB cable and  and run `npx expo run:android`. This will build the app and send it on your device. The operation can last for up to 15 minutes.
* The application should appear on your device. At this point there is no more need of the USB cable (you can disable *USB debugging*).

### Precisions

While running `npx expo run:android`, you can have this error :
```
Task :expo-modules-core:compileDebugKotlin FAILED
e: This version (1.5.15) of the Compose Compiler requires Kotlin version 1.9.25 but you appear to be using Kotlin version 1.9.24 which is not known to be compatible.
```
Follow these steps to fix it :

* In the `android/build.gradle` file, replace the line `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')` by `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')`.
* In the `traque-app` folder, run `npx expo run:android` again.



## Run the app

This section will explain how to run the app. The process is really similar to the one to run the app on Expo go and can be done with your device on the same WI-FI network as your computer.

### Tutorial

* Start the developpement server by running `npm start`, a blue *development build* should appear in your terminal.
* Scan the QR code that appears to start developping.
* If the app crashes, you may need to restart the developpement server.
