// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}

		// Create databases to track categories and tips
		document.addEventListener("deviceready", function onDeviceReady() {
		  var db = window.sqlitePlugin.openDatabase({name: "categories"});

		  db.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id integer primary key, selected boolean, created datetime, modified datetime)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS tips (id integer primary key, shown boolean, done boolean, created datetime, modified datetime)');
		  });
		}, false);
	});
})
.config(function ($stateProvider, $urlRouterProvider, $provide) {
	$stateProvider

		.state('app', {
			url: "/app",
			abstract: true,
			templateUrl: "templates/menu.html",
			controller: 'AppCtrl'
		})

		.state('app.home', {
			url: "/home",
			views: {
				'menuContent': {
					templateUrl: "templates/home.html",
					controller: 'HomeCtrl'
				}
			}
		})
		.state('app.categories', {
			url: "/categories",
			views: {
				'menuContent': {
					templateUrl: "templates/categories.html",
					controller: 'CategoriesCtrl'
				}
			}
		})

		.state('app.single', {
			url: "/tips/tipId",
			views: {
				'menuContent': {
					templateUrl: "templates/tip.html",
					controller: 'TipCtrl'
				}
			}
		});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');

	$provide.decorator('$rootScope', ['$delegate', function($delegate){

		Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
			value: function(name, listener){
				var unsubscribe = $delegate.$on(name, listener);
				this.$on('$destroy', unsubscribe);
			},
			enumerable: false
		});


		return $delegate;
	}]);
});



