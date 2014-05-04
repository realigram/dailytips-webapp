angular.module('dailytips.controllers', ['dailytips.services'])

.controller('AppCtrl', function ($scope) {
})

.controller('CategoriesCtrl', function ($scope, category, ga) {
	$scope.categories = [];
	$scope.$onRootScope('categories-updated', function(){
		$scope.categories = category.categories();
	});

	$scope.toggleSelection = function(item){
		ga.trackEvent("Category", "Select", "Select a category.", item.title);
		category.toggle(item.id);
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		ga.trackScreen("Categories");
		$scope.categories = category.categories();
	}, false);
})

.controller('OnboardCtrl', function($scope, $location, storage, $state, tip, point, toast, notification, achievement, category, ga){
	$scope.onboard = false;
	var startApp = function() {
		ga.trackEvent("Onboard", "App", "App started.", 1);
		console.log("Change path to home.");
		$state.go("app.home");
	};

	var setData = function(){
		$scope.points = point.points();
		$scope.level = point.level();
		$scope.levelPoints = point.levelPoints();
	};

	$scope.next = function() {
		ga.trackEvent("Onboard", "Next", "Next button clicked in onboarding.", 1);
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
	};

	 $scope.slideChanged = function(index) {
		if(index > 0) {
		  $scope.leftButton = {
			  content: 'Back',
			  type: 'button-positive button',
			  tap: function() {
				// Move to the previous slide
				ga.trackEvent("Onboard", "Back", "Back button clicked in onboarding.", 1);
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
				ga.trackEvent("Onboard", "Complete", "All onboard steps completed.", 1);
				startApp();
				storage.set('first-time', false);
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
			ga.trackEvent("Onboard", "Tip", "Onboard tip complete.", 1);
			toast.show("Congratulations!  Here's to many more.")
		});
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		ga.trackScreen("Onboard");
		storage.get('first-time').then(function(firstTime){
			if(firstTime === undefined){
				$scope.onboard = true;
				$scope.leftButton = leftButton;
				$scope.rightButton = rightButton;
			} else {
				startApp();  // Put this back in once testing is done on onboarding!
			}

			setData();
		});
		// Set default notification time.
		var time = storage.get('time').then(function(val){
			if(val === undefined){
				storage.set('time', "08:00").then(function(){
					notification.setNotification();
				});
			}
		});
	}, false);

})

.controller('HomeCtrl', function ($scope, tip, point, storage, toast, ga) {
	var setData = function(){
		$scope.tips = tip.shownTips();
		$scope.tip = tip.tip();
		$scope.points = point.points();
		$scope.level = point.level();
		$scope.levelPoints = point.levelPoints();
	};

	$scope.markDone = function(tipData){
		if(tipData.points == 0){
			tip.markDone(tipData);
			ga.trackEvent("Home", "Done", "Tip done.", tipData.id);
			toast.show("Nice job!  Keep it up!");
		} else {
			tip.updatePoints(tipData.id, 0);
			ga.trackEvent("Home", "Undone", "Tip undone.", tipData.id);
			toast.show("We'll get it next time!");
		}
	};

	$scope.$onRootScope('tips-updated', function(){
		setData();
	});

	$scope.$onRootScope('points-updated', function(){
		ga.trackEvent("Home", "Points", "Points changed.", point.points());
		setData();
	});

	document.addEventListener("deviceready", function onDeviceReady() {
		ga.trackScreen("Home");
		setData();
	}, false);
})

.controller('SettingsCtrl', function($scope, notification, storage, ga){
	$scope.settings = {
		time: undefined
	};

	var getVals = function(){
		storage.get('time').then(function(val){
			$scope.settings.time = val;
		});
	};

	$scope.set = function(key){
		storage.set(key, $scope.settings[key]).then(function(){
			ga.trackEvent("Settings", key, key + " changed.", $scope.settings[key]);
			notification.setNotification();
		});
	};

	document.addEventListener("deviceready", function onDeviceReady() {
		ga.trackScreen("Settings");
		getVals();
	}, false);
})

.controller('AchievementsCtrl', function($scope, achievement, ga){
	$scope.achievements = [];
	$scope.$onRootScope('achievements-updated', function(){
		$scope.achievements = achievement.earnedAchievements();
	});

	document.addEventListener("deviceready", function onDeviceReady() {
		ga.trackScreen("Achievements");
		$scope.achievements = achievement.earnedAchievements();
	}, false);
});