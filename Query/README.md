# Overview
Example of a simple React Native app that uses Couchbase Lite as embedded datastore for offline data storage.
The app uses a reference implementation of a React Native plugin that exports a subset of couchbase lite native APIs to Javascript.

**LICENSE**: The source code for the app and React Native plugin is Apache-licensed, as specified in LICENSE. However, the usage of Couchbase Lite will be guided by the terms and conditions specified in Couchbase's Enterprise or Community License agreements.

# Build
To build the app for specific platform, follow the instructions in the top level README of the repo.

# App Functionality

This version of app extends the "standalone" version of the app and demonstrates basic database [query](https://docs.couchbase.com/couchbase-lite/3.0/android/query-n1ql-mobile.html) and [full-text-search](https://docs.couchbase.com/couchbase-lite/3.0/android/fts.html) operations against Couchbase Lite database. In addition to the "user" database, this version of the app is bundled with a second "university" database pre-seeded with documents against which queries are issued. You can learn more about [prebuilt database](https://docs.couchbase.com/couchbase-lite/3.0/android/prebuilt-database.html).

This app does the following

* Allows users to log in and create or update his/her user profile information. You could do that in the "standalone" version of the app

* As part of profile information, users can now selecting a "university" from a list of possible options

The list of matching universities is queried (using the new Query API) from a local prebuilt "University" Couchbase Lite Database that is bundled in the app. The user profile information is persisted as a Document in the local Couchbase Lite Database. So subsequently, when the user logs out and logs back in again, the profile information is loaded from the Database.


Refer to "**ios**" folder for iOS version of app and the "**android**" folder for Android version of the app.


# Data Model
Couchbase Lite is a JSON Document Store. A Document is a logical collection of named fields and values.The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports Date and Blob data types. While it is not required or enforced, it is a recommended practice to include a "type" property that can serve as a namespace for related documents.

##  The "User Profile" Document
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
The `profilePic` holds metadata of the binary image data associated with the document

## The "University" Document
The app comes bundled with a collection of Documents of type "university". Each Document represents a university.

```json
{
    "type":"university","web_pages": [
      "http://www.rpi.edu/"
    ],
    "name": "Rensselaer Polytechnic Institute",
    "alpha_two_code": "US",
    "state-province": null,
    "domains": [
      "rpi.edu"
    ],
    "country": "United States"
}
```
# Using a Prebuilt Database
There are several reasons why you may want to bundle your app with a prebuilt database. This would be suited for data that does not change or change that often, so you can avoid the bandwidth and latency involved in fetching/syncing this data from a remote server. This also improves the overall user experience by reducing the start-up time.

In our app, the instance of Couchbase Lite that holds the preloaded "university" data is separate from the Couchbase Lite instance that holds "user" data. A separate Couchbase Lite instance is not required. However, in our case, since there can be many users potentially using the app on a given device, it makes more sense to keep it separate. This is to avoid duplication of pre-loaded data for every user.

## Location of the prebuilt file
The pre-built database will be in the form of a cblite file. It should be be in your app project bundle

In the project explorer, locate the `universities.zip` file. The zip archive includes the "universities.cblite" database file.

![](https://blog.couchbase.com/wp-content/uploads/2021/11/prebuilt.png)

