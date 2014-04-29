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
});