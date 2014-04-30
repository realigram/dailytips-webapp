angular.module('dailytips.controllers', ['dailytips.services'])

.controller('AppCtrl', function ($scope) {
})

.controller('CategoriesCtrl', function ($scope, category) {
	$scope.categories = [];
	$scope.$onRootScope('categories-updated', function(){
		$scope.categories = category.categories();
	});

	$scope.toggleSelection = function(item){
		category.toggle(item.id);
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		$scope.categories = category.categories();
	}, false);
})

.controller('TipCtrl', function ($scope, tip, point) {

})

.controller('TipsCtrl', function ($scope, tip, point, toast) {
	var setData = function(){
		$scope.tips = tip.shownTips();
		console.log($scope.tips.length + " shown tips exist.");
		$scope.tip = tip.tip();
	};

	$scope.markDone = function(tipData){
		tip.markDone(tipData);
		toast.show("Nice job!  Keep it up!");
	};

	setData();

	$scope.$onRootScope('tips-updated', function(){
		setData();
	});
})

.controller('OnboardCtrl', function($scope, $location, storage, $state, tip, point, toast, notification){
	$scope.onboard = false;
	var startApp = function() {
		console.log("Change path to home.");
		$state.go("app.home");
	};

	var setData = function(){
		$scope.points = point.points();
		$scope.level = point.level();
		$scope.levelPoints = point.levelPoints();
	};

	$scope.next = function() {
		$scope.$broadcast('slideBox.nextSlide');
	};

	var rightButton = {
		content: 'Next',
		type: 'button-positive button',
		tap: function(e) {
			// Go to the next slide on tap
			$scope.next();
		}
	};

	var leftButton = {
		content: 'Skip',
		type: 'button-positive button',
		tap: function(e) {
			// Start the app on tap
			startApp();
		}
	};

	$scope.leftButton = leftButton;
  	$scope.rightButton = rightButton;

	 $scope.slideChanged = function(index) {
		if(index > 0) {
		  $scope.leftButton = {
			  content: 'Back',
			  type: 'button-positive button',
			  tap: function() {
				// Move to the previous slide
				$scope.$broadcast('slideBox.prevSlide');
			  }
			}
		} else {
		  $scope.leftButton = leftButton;
		}

		if(index == 2) {
		  $scope.rightButton = {
			  content: 'Finish!',
			  type: 'button-positive button',
			  tap: function() {
				startApp();
			  }
			}
		} else {
		  $scope.rightButton = rightButton;
		}
	 };

	$scope.$onRootScope('points-updated', function(){
		setData();
	});

	$scope.$onRootScope('tips-updated', function(){
		var tipIndex = tip.getTipIndexById(16);
		$scope.tip = tip.tips()[tipIndex];
		$scope.tip.pointValue = 100;
	});

	$scope.markDone = function(tipData){
		tip.createTip(tipData.id).then(function(){
			tip.markDone(tipData);
			toast.show("Congratulations!  Here's to many more.")
		});
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		storage.get('first-time').then(function(firstTime){
			if(firstTime === undefined){
				storage.set('first-time', false);
				$scope.onboard = true;
			} else {
				startApp();  // Put this back in once testing is done on onboarding!
			}

			setData();
		});
		// Set default notification time.
		var time = storage.get('time').then(function(val){
			if(val === undefined){
				storage.set('time', "08:00");
				notification.setNotification();
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