angular.module('starter.services', [])

.factory("category", function ($rootScope) {
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
				var time = new Date().toISOString();
				if(res.rows.length > 0){
					selected = res.rows.item(0).selected;
					if(selected === "false"){
						selected = false;
					} else if (selected === "true") {
						selected = true;
					}
					console.log("Updating selected for " + id + " to " + !selected + " from " + selected + " type is " + typeof(selected));
					tx.executeSql("update categories set selected=?,modified=? where id=?;", [!selected, time, id]);
					updateSelected(id, !selected);
				} else {
					tx.executeSql("INSERT INTO categories (id, selected, created, modified) VALUES (?,?,?,?);", [id, selected, time, time]);
					updateSelected(id, selected);
					$rootScope.$emit("categories-updated");
				}
          	});
		});
	};

	var selectedCategories = function(){
		var selCategories = [];
		for(var i = 0; i < categories.length; i++){
			if(categories[i].selected === true){
				selCategories.push(categories[i].title);
			}
		}
		return selCategories;
	};

	setSelected();

	var api = {
		categories: function(){
			return categories;
		},
		toggle: function(id){
			toggleSelection(id);
		},
		selectedCategories: function(){
			return selectedCategories();
		}
	};
	return api;
})

.factory("tip", function($http, $rootScope, $q, category){
	var tips = [];
	var tip = {};
	$http.get('data/tips.json')
       .then(function(res){
          tips = res.data;
		  setShown().then(function(){
			  $rootScope.$emit("tips-updated");
			  selectDailyTip();
		  });
    });

	var getTipIndexById = function(id){
		for(var j = 0; j < tips.length; j++){
			if(tips[j].id === id){
				return j;
			}
		}
		return -1;
	};

	var setShown = function(){
		var d = $q.defer();
		for(var i = 0; i < tips.length; i++){
			tips[i].shown = false;
			tips[i].done = false;
		}
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		db.transaction(function(tx) {
			tx.executeSql('select id, shown, done, created from tips where shown=?;', [true], function(tx, res) {
				for(var i = 0; i < res.rows.length; i++){
					var row = res.rows.item(i);
					var j = getTipIndexById(row.id);
					tips[j].shown = row.shown;
					tips[j].done = row.done;
					tips[j].created = row.created;
				}
				d.resolve(true);
			});
		});
		return d.promise;
	};

	var pickRandomTip = function(){
		var tipOkay = false;
		var tip;
		var counter = 0;
		var categories = category.selectedCategories();
		while(!tipOkay && counter < 200){
			var rand = Math.floor((Math.random() * tips.length));
			if(!tips[rand].shown && categories.indexOf(tips[rand].category) !== -1){
				tipOkay = true;
				tip = tips[rand];
			}
			counter = counter + 1;
		}
		return tip;
	};

	var getLastTip = function(){
		var d = $q.defer();
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		db.transaction(function(tx) {
			tx.executeSql('select * from tips where created=(select max(created) from tips);', [], function(tx, res) {
				if(res.rows.length > 0){
					var index = getTipIndexById(res.rows.item(0).id);
					tip = tips[index];
					tip.created = res.rows.item(0).created;
					$rootScope.$emit("tips-updated");
				}
				d.resolve(tip);
          	});
		});
		return d.promise;
	};

	var selectDailyTip = function(){
		getLastTip().then(function(lastTip){
			var time = new Date();
			console.log("The last tip is", lastTip);
			if(lastTip.created !== undefined){
				var lastTime = new Date(lastTip.created);
				var hourDiff = (time - lastTime) / (1000 * 60 * 60); // Convert to hours.
				console.log("Hour diff from last tip to now is " + hourDiff);
			} else {
				console.log("No daily tip found yet, setting one now.");
				hourDiff = 24;
			}
			if(hourDiff >= 24){
				var newTip = pickRandomTip();
				console.log("Picked a new tip.", newTip);
				var timeString = time.toISOString();
				if(newTip !== undefined){
					var db = window.sqlitePlugin.openDatabase({name: "categories"});
					db.transaction(function(tx) {
						tx.executeSql('INSERT INTO tips (id, shown, created, modified) VALUES (?,?,?,?);', [newTip.id, true, timeString, timeString], function(tx, res) {
							tip = newTip;
							$rootScope.$emit("tips-updated");
						});
					});
				}
			}
		});
	};

	$rootScope.$on("categories-updated", function(){
		selectDailyTip();
	});

	var api = {
		tips: function(){
			return tips;
		},
		tip: function(){
			return tip;
		}
	};
	return api;

});
