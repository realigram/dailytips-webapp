angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function ($scope) {
})

.controller('CategoriesCtrl', function ($scope, category) {
	$scope.categories = category.categories();

	$scope.$watch('category.categories', function() {
       $scope.categories = category.categories();
   	});

	$scope.toggleSelection = function(item){
		category.toggle(item.id);
	}
})

.controller('TipCtrl', function ($scope, $stateParams) {

})

.controller('TipsCtrl', function ($scope, $stateParams) {
});
