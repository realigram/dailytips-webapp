cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/com.phonegap.plugins.sqlite/www/SQLitePlugin.js",
        "id": "com.phonegap.plugins.sqlite.SQLitePlugin",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.local-notification/www/local-notification.js",
        "id": "de.appplant.cordova.plugin.local-notification.LocalNotification",
        "clobbers": [
            "plugin.notification.local"
        ]
    },
    {
        "file": "plugins/me.apla.cordova.app-preferences/www/apppreferences.js",
        "id": "me.apla.cordova.app-preferences.apppreferences",
        "clobbers": [
            "plugins.appPreferences"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.console": "0.2.8",
    "org.apache.cordova.device": "0.2.9",
    "com.phonegap.plugins.sqlite": "1.0.0",
    "de.appplant.cordova.plugin.local-notification": "0.7.4",
    "me.apla.cordova.app-preferences": "0.4.2"
}
// BOTTOM OF METADATA
});