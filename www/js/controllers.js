angular.module('starter.controllers', ['starter.services'])

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

.controller('TipCtrl', function ($scope, $stateParams) {

})

.controller('HomeCtrl', function ($scope, tip) {
	$scope.tips = tip.tips();
	$scope.tip = tip.tip();

	$scope.$onRootScope('tips-updated', function(){
		$scope.tips = tip.tips();
		$scope.tip = tip.tip();
	});
});
