# App Functionality

This app demonstrates basic Database and Document CRUD operations using Couchbase Lite as a standalone, embedded database within your mobile app. A document is created and stored in a "user" Couchbase Lite database.

# Try it Out
* Launch the app
* Log into the app with any email Id and password. Use the values "demo@example.com" and "password" for user Id and password fields respectively.
* If this is the first time that the user is signing in, a new Couchbase Lite database will be created. On subsequent login, the user’s existing database will be opened.
* Enter a "name" for the user and address and select a profile image and Tap "Done"
* Confirm that you see an alert message "successfully Updated Profile". The first time, you update the profile screen, the userprofile document will be created in the database


![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-standalone-1.gif)

* Now tap on the profile image and select an image from the Photo Album. Tap "Done".
* Confirm that you see an alert message "successfully Updated Profile".

![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-standalone-2.gif)

* Log off from app by tapping "Log out" icon button top navigation bar
* Log back into the app with the same user email Id and password that you used earlier. In my example, I used "demo@example.com" and "password". So I will log in with those credentials again.
* Confirm that you see the profile screen with the name and image values that you set earlier. The userprofile document that was created and saved earlier is loaded from the database.

![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-standalone-3.gif)
