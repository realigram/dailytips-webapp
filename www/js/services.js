angular.module('starter.services', [])

.factory("category", function () {
	var categories = [
		{ title: 'Sleep', id: 1 },
		{ title: 'Nutrition', id: 2 },
		{ title: 'Fitness', id: 3 },
		{ title: 'Stress', id: 4 },
		{ title: 'Focus', id: 5 },
		{ title: 'Anxiety', id: 6 },
		{ title: 'Self Confidence', id: 7 }
	];

	var updateSelected = function(id, selected){
		for(var j = 0; j < categories.length; j++){
			if(categories[j].id === id){
				categories[j].selected = selected;
			}
		}
	};

	var setSelected = function(){
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		for(var i = 0; i < categories.length; i++){
			categories[i].selected = false;
		}
		db.transaction(function(tx) {
			tx.executeSql('select * from categories;', [], function(tx, res) {
				for(var i = 0; i < res.rows.length; i++){
					var row = res.rows.item(i);
					var selected;
					if(row.selected === "false"){
						selected = false;
					} else if (row.selected === "true") {
						selected = true;
					}
					updateSelected(row.id, selected);
				}
          	});
		});
	};

	var toggleSelection = function(id){
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		db.transaction(function(tx) {
			var data = tx.executeSql('select * from categories where id=?;', [id], function(tx, res) {
				console.log("res.rows.length: " + res.rows.length);
				console.log(res.rows);
				var selected = true;
				if(res.rows.length > 0){
					selected = res.rows.item(0).selected;
					if(selected === "false"){
						selected = false;
					} else if (selected === "true") {
						selected = true;
					}
					console.log("Updating selected for " + id + " to " + !selected + " from " + selected + " type is " + typeof(selected));
					tx.executeSql("update categories set selected=? where id=?;", [!selected, id]);
					updateSelected(id, !selected);
				} else {
					tx.executeSql("INSERT INTO categories (id, selected) VALUES (?,?);", [id, selected]);
					updateSelected(id, selected);
				}
          	});
		});
	};

	setSelected();

	var api = {
		categories: function(){
			return categories;
		},
		toggle: function(id){
			toggleSelection(id);
		}
	};
	return api;
});