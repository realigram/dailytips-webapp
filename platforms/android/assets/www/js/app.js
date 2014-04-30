// Daily Tips App
angular.module('dailytips', ['ionic', 'dailytips.directives', 'dailytips.controllers'])

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
				// Only create tables if they don't exist.
				tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id integer primary key, selected boolean, created datetime, modified datetime)');
				tx.executeSql('CREATE TABLE IF NOT EXISTS tips (id integer primary key, shown boolean, points integer, created datetime, modified datetime)');
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

		.state('app.onboard', {
			url: "/onboard",
			views: {
				'menuContent': {
					templateUrl: "templates/onboard.html",
					controller: 'OnboardCtrl'
				}
			}
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

		.state('app.tips', {
			url: "/tips",
			views: {
				'menuContent': {
					templateUrl: "templates/tips.html",
					controller: 'TipsCtrl'
				}
			}
		})

		.state('app.settings', {
			url: "/settings",
			views: {
				'menuContent': {
					templateUrl: "templates/settings.html",
					controller: 'SettingsCtrl'
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
	$urlRouterProvider.otherwise('/app/onboard');

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



