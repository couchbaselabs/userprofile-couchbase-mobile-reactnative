
# App Functionality

This version of app extends the "standalone" version of the app and demonstrates basic database [query](https://docs.couchbase.com/couchbase-lite/3.0/android/query-n1ql-mobile.html) and [full-text-search](https://docs.couchbase.com/couchbase-lite/3.0/android/fts.html) operations against Couchbase Lite database. In addition to the "user" database, this version of the app is bundled with a second "university" database pre-seeded with documents against which queries are issued. You can learn more about [prebuilt database](https://docs.couchbase.com/couchbase-lite/3.0/android/prebuilt-database.html).

This app does the following

* Allows users to log in and create or update his/her user profile information. You could do that in the "standalone" version of the app

* As part of profile information, users can now selecting a "university" from a list of possible options

The list of matching universities is queried (using the new Query API) from a local prebuilt "University" Couchbase Lite Database that is bundled in the app. The user profile information is persisted as a Document in the local Couchbase Lite Database. So subsequently, when the user logs out and logs back in again, the profile information is loaded from the Database.


# Try it Out
* Launch the app
* Log into the app with any email Id and password. Use the values "demo@example.com" and "password" for user Id and password fields respectively.
* If this is the first time that any user is signing in to the app, the pre-built database will be loaded from the App Bundle. In addition, new user-specific Database will be created/opened. On subsequent login, the user’s existing user database will be opened. The prebuilt database is shared across all users of the app.
* Tap on "CHoose" option from profile screen
* You should see a screen show that allows you enter the search criteria for the university
* Enter "Harv" for name. You can optionally enter "united states" for location
* Confirm that you see a list of universities that match the criteria
* Select a university
* Press "Done" button
* Confirm that the university you selected shows up in the University entry
* You can optionally update the other entries in the User Profile screen
* Tap "Done" button
* Confirm that you see an alert message "Successfully Updated Profile". The Document will be updated this time.
![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-query-1.gif)

* Tap "Log Off" icon  and log out of the app
* Log back into the app with the same user email Id and password that you used earlier. In my example, I used "demo@example.com" and "password". So I will log in with those credentials again.
* Confirm that you see the profile screen with the university value that you set earlier.

![](https://blog.couchbase.com/wp-content/uploads/2021/11/reactnative-query-2.gif)
