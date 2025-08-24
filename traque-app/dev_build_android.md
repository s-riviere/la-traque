# How to create a local developpement build with Expo
Expo go is great to start a React Native project with Expo but reaches its limits when background localisation or server notifications have to be implemented and tested. This tutorial will explain the steps to create the debug android app of the current project (ie developpement build) and download it on an android device. A similar process can be done to test the IOS app but it requires a Mac so this won't be covered in this tutorial. A virtual android device can be created with Android Studio (explained later) but the process to send the app on the virtual device isn't covered in this tutorial. Here is a link that may help you : https://youtu.be/cs-zgHjt5RQ?si=Fzxik7zreek07uC0. Each step has precisions, however some of those precisions may not be suited for your device, don't hesitate to find help on the Internet or ask ChapGPT.


## Set up your environnement

This section will cover the set up of your environnement in order to have the tools to either send the apk of your app on your device or create a virtual android device.

### Tutorial

Follow this tutorial : https://reactnative.dev/docs/set-up-your-environment?os=linux&platform=android

### Precisions

* Android Studio and its dependancies can take up to 15 Go of space.
* The `.bashrc` file is located in your home directory (`cd ~`).
* The Watchman installation isn't necessary.
* If you want to test your app on a physical android device, follow the next section.


## Set up your physical android device

This section will cover the actions to perform on your device to be able to download the apk of the app.

### Tutorial

Follow the two first sections of this tutorial : https://reactnative.dev/docs/running-on-device?os=linux&platform=android

### Precisions

* In some devices, you may also enable the *install via USB* option.
* There is no need to modify the `/etc/udev/rules.d/51-android-usb.rules`, you can skip this part of the tutorial.
* When your device is connected, keep in your mind that a pop up asking authorizations can appear on it.


## Build the native app

This section will cover the building of the app and the sending on your device.

### Tutorial

* Go in your project folder (`traque-app`).
* Run `npx expo install expo-dev-client`. This install the `expo-dev-client` package if it isn't already.
* Run `npx expo prebuild --platform android`. This will add an android folder in your project taking about 1 Go of space.
* Connect your device to your computer with a USB cable and  and run `npx expo run:android`. This will build the app and send it on your device. The operation can last for up to 10 minutes and will take up to 10 Go of space in total (mainly cache in the `~/.gradle` folder).
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
* Enter the created app on your device. The app will update as well as if you were on Expo go if you modify the code on your computer.
* If the app crashes, you may need to restart the developpement server.
