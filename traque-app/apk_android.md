# How to create an apk

An apk is an app file that can be installed on an android device without the need of google play store. This tutorial will explain the steps to create the apk of the current project and download it on an android device. Each step has precisions, however some of those precisions may not be suited for your device, don't hesitate to find help on the Internet or ask ChapGPT.



## Set up your environnement

This section will cover the set up of your environnement in order to have the tools to either send the apk of your app on your device or create a virtual android device.

### Tutorial

Follow this tutorial : https://reactnative.dev/docs/set-up-your-environment?os=linux&platform=android

### Precisions

* Android Studio and its dependancies can take up to 15 Go of space.
* The `.bashrc` file is located in your home directory (`cd ~`).
* The Watchman installation isn't necessary.
* If you want to test your app on a physical android device, follow the next section.



## Create the android folder

This section will cover the creation of the android folder if it isn't created yet.

### Tutorial

* Go in your project folder (`traque-app`).
* Run `npx expo install expo-dev-client`. This install the `expo-dev-client` package if it isn't already.
* Run `npx expo prebuild --platform android`. This will add an android folder in your project taking about 1 Go of space.



## Create and add the app key

This section will cover the creation of the app key which is required by google play store. You will need the `.keystore` file associated to the app. If no one in the team have created it yet follow *Tutorial Part A* then *Tutorial Part B*, else get the `.keystore` file, the storePassword, the keyAlias and the keyPassword, and follow *Tutorial Part B*.

### Tutorial Part A

* Go in the folder `traque-app/android/app/`.
* Run `keytool -genkey -v -keystore release.keystore -alias traque_key -keyalg RSA -keysize 2048 -validity 10000`, note that `release` and `traque_key` can be modified if you want.

### Tutorial Part B

* Go in the folder `traque-app/android/app/`.
* Here paste the `.keystore` file associated with your app.
* Modify the android bracket of the `traque-app/android/app/build.gradle` file as follows : 

```
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


## Create the apk

This section will cover the creation of the apk of the app that can be download and installed on any android device.

### Tutorial

* Go in the folder `traque-app/android/`.
* Run `./gradlew assembleRelease`.
* At the end, the created apk will be located in the `traque-app/android/app/build/outputs/apk/release/` folder.

### Precisions

While running `./gradlew assembleRelease`, you can have this error :
```
Task :expo-modules-core:compileDebugKotlin FAILED
e: This version (1.5.15) of the Compose Compiler requires Kotlin version 1.9.25 but you appear to be using Kotlin version 1.9.24 which is not known to be compatible.
```
Follow these steps to fix it :

* In the `android/build.gradle` file, replace the line `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')` by `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')`.
* In the `traque-app/android/` folder, run `./gradlew assembleRelease` again.

### Other precisions

If the build fail for obscure reasons, it may be usefull to delete entirely the `node_modules/` folder and recreate it by running `npm i`. 
If problems persist, you may also delete entirely the `android/` folder and recreate it.
If the problem persist, you may also delete the `~/.gradle/caches/` folder.
If the problem persist, stop working on the project, you can't go against god's will.
