angular.module('dailytips.controllers', ['dailytips.services'])

.controller('AppCtrl', function ($scope) {
})

.controller('CategoriesCtrl', function ($scope, category) {
	$scope.categories = category.categories();

	$scope.$watch('categories', function(newValue, oldValue, scope) {
       $scope.categories = newValue;
   	}, true);

	$scope.toggleSelection = function(item){
		category.toggle(item.id);
	}
})

.controller('TipCtrl', function ($scope, tip, point) {

})

.controller('TipsCtrl', function ($scope, tip, point) {
	var setData = function(){
		$scope.tips = tip.shownTips();
		console.log($scope.tips.length + " shown tips exist.");
		$scope.tip = tip.tip();
	};

	$scope.markDone = function(tipData){
		tip.markDone(tipData);
	};

	setData();

	$scope.$onRootScope('tips-updated', function(){
		setData();
	});
})

.controller('OnboardCtrl', function($scope, $location, storage, $state){
	var startApp = function() {
		console.log("Change path to home.");
		$state.go("app.home");
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		storage.get('first-time').then(function(firstTime){
			if(firstTime === undefined){
				storage.set('first-time', false);
			} else {
				startApp();
			}
		});
	}, false);

})

.controller('HomeCtrl', function ($scope, tip, point, storage) {
	var setData = function(){
		$scope.tips = tip.tips();
		$scope.tip = tip.tip();
		$scope.points = point.points();
		$scope.level = point.level();
		$scope.levelPoints = point.levelPoints();
	};

	$scope.markDone = function(tipData){
		tip.markDone(tipData);
	};

	$scope.$onRootScope('tips-updated', function(){
		setData();
	});

	$scope.$onRootScope('points-updated', function(){
		setData();
	});

	document.addEventListener("deviceready", function onDeviceReady() {
		setData();
	}, false);
})

.controller('SettingsCtrl', function($scope, notification, storage){
	$scope.settings = {
		time: undefined
	};

	var getVals = function(){
		storage.get('time').then(function(val){
			$scope.settings.time = val;
		});
	};

	$scope.set = function(key){
		storage.set(key, $scope.settings[key]);
		notification.setNotification();
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		getVals();
	}, false);
});