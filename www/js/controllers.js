angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope) {
})

.controller('CategoriesCtrl', function ($scope) {
	$scope.categories = [
		{ title: 'Sleep', id: 1 },
		{ title: 'Nutrition', id: 2 },
		{ title: 'Fitness', id: 3 },
		{ title: 'Stress', id: 4 },
		{ title: 'Focus', id: 5 },
		{ title: 'Anxiety', id: 6 },
		{ title: 'Self Confidence', id: 7 }
	];

	$scope.setTruth = function(){
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		for(var i = 0; i < $scope.categories.length; i++){
			$scope.categories[i].selected = false;
		}
		db.transaction(function(tx) {
			tx.executeSql('select * from categories;', [], function(tx, res) {
				for(var i = 0; i < res.rows.length; i++){
					var row = res.rows.item(i);
					for(var j = 0; j < $scope.categories.length; j++){
						if($scope.categories[j].id === row.id){
							$scope.categories[j].selected = row.selected;
						}
					}
				}
          	});
		});
	};

	$scope.toggleCategory = function(item){
		console.log(item);
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		db.transaction(function(tx) {
			var data = tx.executeSql('select * from categories where id=?;', [item.id], function(tx, res) {
				console.log("res.rows.length: " + res.rows.length);
				console.log(res.rows);
				var selected = true;
				if(res.rows.length > 0){
					selected = res.rows.item(0).selected;
					selected = !selected;
					tx.executeSql("update categories set selected=? where id = ?;", [selected, item.id]);
				} else {
					tx.executeSql("INSERT INTO categories (id, selected) VALUES (?,?);", [item.id, selected]);
				}

          	});
		});
	}
})

.controller('TipCtrl', function ($scope, $stateParams) {

})

.controller('TipsCtrl', function ($scope, $stateParams) {
});
