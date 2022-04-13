# Overview
Example of a simple React Native app that uses Couchbase Lite as the embedded datastore for offline data storage.
The app uses a reference implementation of a React Ntive plugin that exports a subset of couchbase lite native APIs to Javascript.


**LICENSE**: The source code for the app and React Native plugin is Apache-licensed, as specified in LICENSE. However, the usage of Couchbase Lite will be guided by the terms and conditions specified in Couchbase's Enterprise or Community License agreements.

# Build
To build the app for specific platform, follow the instructions in the top level README of the repo.

# App Functionality

This app demonstrates basic Database and Document CRUD operations using Couchbase Lite as a standalone, embedded database within your mobile app. A document is created and stored in a "user" Couchbase Lite database.

Refer to "**ios**" folder for iOS version of app and the "**android**" folder for Android version of the app

# Data Model
Couchbase Lite is a JSON Document Store. A Document is a logical collection of named fields and values.The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports Date and Blob data types. While it is not required or enforced, it is a recommended practice to include a "type" property that can serve as a namespace for related documents.

## The "User Profile" Document
The app deals with a single document with a "type" property of "user". The document ID is of the form **"user::<email>"**.

An example of a document would be
```json
{
    "type":"user",
    "name":"Jane Doe",
    "email":"jane.doe@earth.org",
    "address":"101 Main Street",
    "profilePic": << Blob Metadata >>
}
```
The profilePic holds metadata of the binary image data associated with the document
