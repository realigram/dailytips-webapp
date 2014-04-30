angular.module('dailytips.directives', [])

.directive('dtTipCard', function () {
	return {
		restrict: 'E',
      	templateUrl: 'templates/partials/tip.html'
    };
})

.directive('dtNoTips', function(){
	return {
		restrict: 'E',
      	templateUrl: 'templates/partials/no-tips.html'
    };
})

.directive('dtCategories', function(){
	return {
		restrict: 'E',
      	templateUrl: 'templates/partials/categories.html'
    };
})

.directive('dtPoints', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/partials/points.html'
		};
	})

.directive('dtAchievements', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/partials/achievements.html'
		};
	});