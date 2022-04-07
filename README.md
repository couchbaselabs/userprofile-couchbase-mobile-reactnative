# Overview
Example of a simple React Native app on Android that uses Couchbase Lite as embedded datastore for offline data storage and Sync Gateway/Couchbase Server for remote data sync.
The app uses a [reference implementation of React Native Module](https://github.com/couchbaselabs/couchbase-lite-react-native-module) that exposes a subset of couchbase lite APIs.

LICENSE: The source code for the app is Apache-licensed, as specified in LICENSE. However, the usage of Couchbase Lite will be guided by the terms and conditions specified in Couchbase's Enterprise or Community License agreements.

This repo contains three versions of the app, each building on the previous version of the app and demonstrating a specific addional functionality of Couchbase Lite. Each version of the app includes an iOS version and a corrresponding Android version.

# Demo 

Shown below is a demonstration of data sync capability between iOS and Android versions of the app

![](https://blog.couchbase.com/wp-content/uploads/2022/03/overview-android-ios.gif)
# Folder Overview

## standalone
This version of app demonstrates basic database and document CRUD operations using Couhbase Lite as a standalone, embedded database within your mobile app. A document is created and stored in a "user" Couchbase Lite database.

For details, refer to the README in the "standalone" folder of the repo.

## query
This version of app extends the "standalone" version of the app and demonstrates basic query and full-text-search operations against Couhbase Lite database. In addition to the "user" database, this version of the app is bundled with a second "university" database pre-seeded with documents against which queries are issued.

For details, refer to the README in the "query" folder of the repo.

## sync
This version of app extends the "query" version of the app and demonstrates basic database sync functionality. The app supports bi-directional sync with a remote Couchbase Server database through a Sync Gateway.

For details, refer to the README in the "sync" folder of the repo.

# Getting Started

Each version of the app includes an iOS version and a corrresponding Android version. Follow the corresponding instructions based on the version you are building.

## Android Version

The instructions apply to standalone, query and sync versions of the app.

**Prerequisites**

* [React Native Development Tools](https://reactnative.dev/docs/environment-setup). 
* Install node v16 or newer. This includes npx.
* npm v8+ (installed globally)
* yarn version 1.22+ (installed globally)
* [Android Studio 4.2 or above](https://developer.android.com/studio)
* Android device or emulator running API level 29 or above
* Android SDK 29
* Android Build Tools 29
* [JDK 8 (min)](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) 


**Build**

* clone repository

```bash
git clone https://github.com/couchbaselabs/userprofile-couchbase-mobile-reactnative
```

* Go to the folder containing the appropriate version of app. For example, for the "standalone" version of app, switch to standalone folder, for the "query" version of app, switch to "query" folder and so on.

```bash
cd  /path/to/cloned-repo/standalone

```
 
* Install couchbase lite react native plugin. For this, follow [instructions](https://github.com/couchbaselabs/couchbase-lite-react-native-module/) to add the module to the project. Instructions are repeated here for convenience. In case of discrepencies, refer to the module repo.
 
```bash
 yarn add https://github.com/couchbaselabs/couchbase-lite-react-native-module

```
 
* Install dependencies 
 
```bash
 npm install
```

* Add native couchbase lite framework as a dependency

The module does not come bundled with the couchbase lite framework. You will have to include the appropriately licensed Couchbase Lite Android library as dependency within your app.
 
The React native reference module requires minimal version of **Couchbase Lite v3.0.0**. 

* Open the Android project located inside your React Native project under directory: `/path/to/userprofile-couchbase-mobile-reactnative-android/android` using Android Studio.

In your 'app' level `build.gradle` file, add your library file path 

```bash
 dependencies {
    implementation 'com.couchbase.lite:couchbase-lite-android:${version}'
 }
```

In your 'project' level `build.gradle` file, add your library file path. 

```bash
 buildscript {
    ...
    ext {
        ...
        // Add this line
        cblVersion = 'com.couchbase.lite:couchbase-lite-android:${version}'
        ...
        }
    ...
}
```

**Running the App**

Build and run the app per instructions in [Getting Started Guide]("https://reactnative.dev/docs/environment-setup"). You can run the app direcly from Android Studio or from command line.

Don't forget to start the Metro bundler before running your app!

```bash
npx react-native start
```

## iOS Version

The instructions apply to standalone, query and sync versions of the app

**Prerequisites**

* [React Native Development Tools](https://reactnative.dev/docs/environment-setup). 
* Install node v16 or newer. This includes npx.
* npm v8+ (installed globally)
* yarn version 1.22+ (installed globally)
* xcode v12.4+


**Build**

* clone repository

```bash
git clone https://github.com/couchbaselabs/userprofile-couchbase-mobile-reactnative
```

* Go to the folder containing the appropriate version of app. For example, for the "standalone" version of app, switch to standalone folder, for the "query" version of app, switch to "query" folder and so on.

```bash
cd  /path/to/cloned-repo/standalone

```
 
* Install couchbase lite react native plugin. For this, follow [instructions](https://github.com/couchbaselabs/couchbase-lite-react-native-module/) to add the module to the project. Instructions are repeated here for convenience. In case of discrepencies, refer to the module repo.
 
```bash
 yarn add https://github.com/couchbaselabs/couchbase-lite-react-native-module

```
 
* Install dependencies 
 
```bash
 npm install
```

* Install the React Native module pod and corresponding Couchbase Lite dependency

```
cd ios
pod install

```

* Open the `userprofiledemo.xcworkspace` project using Xcode. We recommend min Xcode v12.4

```bash
open userprofiledemo.xcworkspace
```

##  Running the App
Build and run the app per instructions in [Getting Started Guide]("https://reactnative.dev/docs/environment-setup"). You can run the app direcly from Xcode or from command line.

Don't forget to start the Metro bundler before running your app!

```bash
npx react-native start
```


