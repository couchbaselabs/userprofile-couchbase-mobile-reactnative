# Overview
Example of a simple React Native app that uses Couchbase Lite as embedded datastore for offline first data storage.
The app uses a reference implementation of a React Native plugin that exports a subset of couchbase lite native APIs to Javascript.

**LICENSE**: The source code for the app and React Native plugin is Apache-licensed, as specified in LICENSE. However, the usage of Couchbase Lite will be guided by the terms and conditions specified in Couchbase's Enterprise or Community License agreements.

# Build
To build the app for specific platform, follow the instructions in the top level README of the repo.

# App Functionality

This version of app extends the "query" version of the app and demonstrates basic database sync functionality. The app supports bi-directional sync with a remote Couchbase Server database through a [Sync Gateway](https://docs.couchbase.com/couchbase-lite/3.0/android/replication.html).


Couchbase Sync Gateway is a key component of the Couchbase Mobile stack. It is an Internet-facing synchronization mechanism that securely syncs data across devices as well as between devices and the cloud.

The core functions of the Sync Gateway include

* Data Synchronization across devices and the cloud
* Authorization & Access Control
* Data Validation

This app does the following

* Allows users to log in and create or update his/her user profile information. The user profile view is automatically updated everytime the profile information changes in the underlying database

* The user profile information is synced with a remote Sync Gateway which then syncs it to other devices (subject to access control and routing configurations specified in the sync function)


Refer to "**ios**" folder for iOS version of app and the "**android**" folder for Android version of the app.

![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-sync-1.gif)

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

# Backend Installation
We will install Couchbase Server and Sync Gateway using docker.

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/) must be installed on your laptop. On WIndows, you may need admin privileges. Ensure that you have sufficient memory and cores allocated to docker. At Least 3GB of RAM is recommended.

## Docker Network
* Create a docker network named “workshop”

```bash
docker network ls

docker network create -d bridge workshop
```

## Couchbase Server

### Install
We have a custom docker image`priyacouch/couchbase-server-userprofile:7.0.0-dev` of  couchbase server that creates an empty bucket named “userprofile” and creates an RBAC user “admin” with “sync gateway” role.

Alteranatively, you can follow the instructions in our [Sync Gateway Getting Started](https://docs.couchbase.com/sync-gateway/3.0/get-started-prepare.html) guide to install Couchbase Server and configure it with relevat bucket.

```bash
docker stop cb-server

docker rm cb-server

docker run -d --name cb-server --network workshop -p 8091-8094:8091-8094 -p 11210:11210 priyacouch/couchbase-server-userprofile:7.0.0-dev
```
### Test Server Install

* The server would take a few minutes to deploy and get fully initialized. So be patient.

```bash
docker logs -f cb-server
```

* You should see the following once setup is completed

```bash
(#0)
> POST /settings/web HTTP/1.1
> Host: 127.0.0.1:8091
> User-Agent: curl/7.66.0-DEV
> Accept: */*
> Content-Length: 50
> Content-Type: application/x-www-form-urlencoded
>
} [50 bytes data]
* upload completely sent off: 50 out of 50 bytes
* Mark bundle as not supporting multiuse
< HTTP/1.1 401 Unauthorized
< Cache-Control: no-cache,no-store,must-revalidate
< Connection: close
< Content-Length: 0
< Date: Wed, 18 Aug 2021 19:53:29 GMT
< Expires: Thu, 01 Jan 1970 00:00:00 GMT
< Pragma: no-cache
< Server: Couchbase Server
< WWW-Authenticate: Basic realm="Couchbase Server Admin / REST"
< X-Content-Type-Options: nosniff
< X-Frame-Options: DENY
< X-Permitted-Cross-Domain-Policies: none
< X-XSS-Protection: 1; mode=block
<
100    50    0     0  100    50      0   4166 --:--:-- --:--:-- --:--:--  4545
* Closing connection 0
SUCCESS: Bucket created
SUCCESS: User admin set
/entrypoint.sh couchbase-server
```

* Then open up http://localhost:8091 in browser
Sign in as “Administrator” and “password” in login page

* Go to “buckets” menu and confirm “userprofile” bucket is created
![](https://blog.couchbase.com/wp-content/uploads/2021/11/Screen-Shot-2021-11-07-at-4.39.08-PM-e1636345591885.png)

* Go to “security” menu and confirm “admin” user is created
![](https://blog.couchbase.com/wp-content/uploads/2021/11/Screen-Shot-2021-11-07-at-4.39.20-PM-e1636345636217.png)

## Sync Gateway

### Install

* The Sync Gateway needs to be bootstrapped with a startup configuration file.

* The configuration file corresponding to the sample application is available in the github repo hosting the app under the "Sync" folder.

    * [sync-gateway-config-userprofile-demo.json](https://github.com/rajagp/userprofile-couchbase-mobile-reactnative-android/blob/main/sync/sync-gateway-config-userprofile-demo.json): The Sync Gateway 2.x compatible version of configuration file.

    * [sync-gateway-config-userprofile-demo.3.0.json](https://github.com/rajagp/userprofile-couchbase-mobile-reactnative-android/blob/main/sync/sync-gateway-config-userprofile-demo.3.0.json): The Sync Gateway 2.x compatible version of configuration file.

    **Note** that starting Sync Gateway 3.0, only the bootstrap information needs to be provided in the config file. The Sync Gateway database configuration is recommended to be handled via REST endpoint. The tutorial continues to use the ["legacy/ pre-3.0 compatability mode"](https://docs.couchbase.com/sync-gateway/3.0/configuration-properties.html)  with `disable_persistent_config` option in of configuration file set to `true`.

* Switch to the the folder which contains the downloaded json file and run the following commands

```bash
cd /path/to/cloned/repo/sync
```

* Follow these instructions to deploy Sync Gateway with the downloaded config file

```bash
docker stop sync-gateway

docker rm sync-gateway
```

  * **Windows Systems**:

   Installing Sync Gateway 3.0

```bash
docker run -p 4984-4985:4984-4985 --network workshop --name sync-gateway -d -v %cd%/sync-gateway-config-userprofile-demo.3.0.json:/etc/sync_gateway/sync_gateway.json couchbase/sync-gateway:3.0.0-beta02-enterprise -adminInterface :4985 /etc/sync_gateway/sync_gateway.json
```

Installing Sync Gateway 2.8

```bash
docker run -p 4984-4985:4984-4985 --network workshop --name sync-gateway -d -v %cd%/sync-gateway-config-userprofile-demo.json:/etc/sync_gateway/sync_gateway.json couchbase/sync-gateway:2.8.3-enterprise -adminInterface :4985 /etc/sync_gateway/sync_gateway.json
```

  * **Non-Windows Systems**:

  Installing Sync Gateway 3.0

```bash
docker run -p 4984-4985:4984-4985 --network workshop --name sync-gateway -d -v `pwd`/sync-gateway-config-userprofile-demo.3.0.json:/etc/sync_gateway/sync_gateway.json couchbase/sync-gateway:3.0.0-beta02-enterprise  -adminInterface :4985 /etc/sync_gateway/sync_gateway.json
```


Installing Sync Gateway 2.8

```bash
non-Windows Systems:
docker run -p 4984-4985:4984-4985 --network workshop --name sync-gateway -d -v `pwd`/sync-gateway-config-userprofile-demo.json:/etc/sync_gateway/sync_gateway.json couchbase/sync-gateway:2.8.3-enterprise -adminInterface :4985 /etc/sync_gateway/sync_gateway.json
```

### Test Installation

* You can confirm that the Sync Gateway is up and running by verifying the log messages

```bash
docker logs -f sync-gateway
```

You will see bunch of log messages. Make sure no errors

* Then  open up http://localhost:4984 in browser
You should see equivalent of the following message

```bash
{"couchdb":"Welcome","vendor":{"name":"Couchbase Sync Gateway","version":"3.0"},"version":"Couchbase Sync Gateway/{version-maintenance}(145;e3f46be) EE"}
```

Now that we have the server and sync gateway backend installed, we can verify data sync between Couchbase Lite enabled apps.

# Try It Out #1

* Launch the app on two emulators (or devices)
* Log into both the app with same userId and password. Use the values "demo@example.com" and "password" for user Id and password fields respectively
* On one devce, update profile values
* Confirm that changes show up in the app on the other emulator.


![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-sync-1.gif)

# Try It Out #2

The follow steps must follow the steps in the previous "Try It Out" section

* Log into Couchbase Server by accessing the admin UI at `http://localhost:8091`
* Search for document with ID `"user::demo@example.com"`.
* Edit the document
* Confirm that the changes show up on the clients

![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-sync-2.gif)

