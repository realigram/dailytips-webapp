Fitalize
=====================

Installation
------------------------------

### Main

* Install cordova and ionic `sudo npm install -g cordova ionic gulp`
* Install android SDK version 19.
* Export ANDROID_HOME=<sdk install directory>/adt-bundle-windows-x86_64-20140321/sdk
* Add sdk platform-tools path and tools path to PATH.
* Install apache ant.
* Add ANT_HOME env variable.
* Run `npm install` in base directory.

### Cordova Plugins (should already be installed)

* `cordova plugin add https://github.com/brodysoft/Cordova-SQLitePlugin`
* `cordova plugin add de.appplant.cordova.plugin.local-notification && cordova prepare`
* `cordova plugin add me.apla.cordova.app-preferences`
* `cordova plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git && cordova prepare`
* `cordova plugin add https://github.com/danwilson/google-analytics-plugin.git`

See [this link](http://stackoverflow.com/questions/20323787/cordova-platform-add-android-not-working-while-listing-android-targets) for details.

Usage
------------------------


### Build

```
ionic build android
```

### Emulate/Run

```
ionic emulate android
```

```
ionic run android
```

### Test

```
cd www
python -m SimpleHTTPServer 8000
```

### Debug

Run monitor with `monitor` to see console log output.
Inspect sqlite database by using the "pull from device" function of the emulator.

See [this link](http://ionicframework.com/getting-started/) for more help.

Publishing
-------------------------------------------------

* Remove unneeded plugins -- ie `cordova plugin rm org.apache.cordova.console`.
* Edit platforms/android/AndroidManifest.xml -- set debuggable to false.
* `cordova build --release android`
* `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/fitalize.keystore DailyTips-release-unsigned.apk fitalize`
* `zipalign -v 4 DailyTips-release-unsigned.apk DailyTips.apk`

See [this page](http://ionicframework.com/docs/guide/publishing.html).



Using Sass (optional)
-------------------------------------------------

Summary:  Run `gulp` when making SASS modifications.

This project makes it easy to use Sass (the SCSS syntax) in your projects. This enables you to override styles from Ionic, and benefit from
Sass's great features.

Just update the `./scss/ionic.app.scss` file, and run `gulp` or `gulp watch` to rebuild the CSS files for Ionic.

Note: if you choose to use the Sass method, make sure to remove the included `ionic.css` file in `index.html`, and then uncomment
the include to your `ionic.app.css` file which now contains all your Sass code and Ionic itself:

```html
<!-- IF using Sass (run gulp sass first), then remove the CSS include above
<link href="css/ionic.app.css" rel="stylesheet">
-->
```