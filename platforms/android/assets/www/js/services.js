angular.module('dailytips.services', [])

.factory("category", function ($rootScope, $http, $q) {
	var categories = [];
	document.addEventListener("deviceready", function onDeviceReady() {
		$http.get('data/categories.json')
		   .then(function(res){
			  categories = res.data;
			  setSelected().then(function(){
				  $rootScope.$emit("categories-updated");
			  });
		});
	}, false);

	var updateSelected = function(id, selected){
		for(var j = 0; j < categories.length; j++){
			if(categories[j].id === id){
				categories[j].selected = selected;
			}
		}
	};

	var setSelected = function(){
		var d = $q.defer();
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
				d.resolve(true);
          	});
		});
		return d.promise;
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
	document.addEventListener("deviceready", function onDeviceReady() {
		$http.get('data/tips.json')
		   .then(function(res){
			  tips = res.data;
			  setShown().then(function(){
				  $rootScope.$emit("tips-updated");
				  selectDailyTip();
			  });
		});
	}, false);

	$rootScope.$on("categories-updated", function(){
		selectDailyTip();
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
			tips[i].points = 0;
			tips[i].pointValue = 0;
		}
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		db.transaction(function(tx) {
			tx.executeSql('select id, shown, points, created from tips where shown=?;', [true], function(tx, res) {
				for(var i = 0; i < res.rows.length; i++){
					var row = res.rows.item(i);
					var j = getTipIndexById(row.id);
					tips[j].shown = true;
					tips[j].points = row.points;
					tips[j].created = row.created;
					tips[j].pointValue = getPointsForTip(row.created);
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
		if(tips.length > 0){
			while(!tipOkay && counter < 200){
				var rand = Math.floor((Math.random() * (tips.length-1)));
				if(!tips[rand].shown && categories.indexOf(tips[rand].category) !== -1){
					tipOkay = true;
					tip = tips[rand];
				}
				counter = counter + 1;
			}
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

	var getHourDiff = function(created){
		var time = new Date();
		var lastTime = new Date(created);
		return (time - lastTime) / (1000 * 60 * 60); // Convert to hours.
	};

	var selectDailyTip = function(){
		getLastTip().then(function(lastTip){
			var time = new Date();
			console.log("The last tip is", lastTip);
			if(lastTip.created !== undefined){
				var hourDiff = getHourDiff(lastTip.created);
				console.log("Hour diff from last tip to now is " + hourDiff);
			} else {
				console.log("No daily tip found yet, setting one now.");
				hourDiff = 24;
			}
			if(hourDiff >= 24){
				var newTip = pickRandomTip();
				console.log("Picked a new tip.", newTip);
				var timeString = new Date().toISOString();
				if(newTip !== undefined){
					var db = window.sqlitePlugin.openDatabase({name: "categories"});
					db.transaction(function(tx) {
						tx.executeSql('INSERT INTO tips (id, shown, points, created, modified) VALUES (?,?,?,?,?);', [newTip.id, true, 0, timeString, timeString], function(tx, res) {
							tip = newTip;
							tip.shown = true;
							tip.created = time;
							tip.pointValue = getPointsForTip(time);
							var index = getTipIndexById(tip.id);
							tips[index] = tip;
							$rootScope.$emit("tips-updated");
						});
					});
				}
			}
		});
	};

	var getPointsForTip = function(created){
		var hourDiff = getHourDiff(created);
		var points = 0;
		if(hourDiff < 24){
			points = 100;
		} else if (hourDiff < 48){
			points = 30;
		} else {
			points = 10;
		}
		return points;
	};

	var updatePoints = function(id, points){
		var d = $q.defer();
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		db.transaction(function(tx) {
			tx.executeSql('update tips set points=? where id=?;', [points, id], function(tx, res) {
				var index = getTipIndexById(id);
				tips[index].points = points;
				$rootScope.$emit("tips-updated");
				d.resolve(true);
			});
		});
		return d.promise;
	};

	var markTipDone = function(tip){
		var d = $q.defer();
		updatePoints(tip.id, tip.pointValue).then(function(){
			d.resolve(true);
		});
		return d.promise;
	};

	var api = {
		tips: function(){
			return tips;
		},
		tip: function(){
			return tip;
		},
		markDone: function(tip){
			return markTipDone(tip);
		},
		shownTips: function(){
			var shown = [];
			for(var i = 0; i < tips.length; i++){
				if(tips[i].shown === true){
					shown.push(tips[i]);
				}
			}
			return shown;
		}
	};
	return api;

})

.factory("point", function($http, $rootScope, $q, tip){
	var points = 0;
	var level = 1;
	var levelPoints = 0;
	$rootScope.$on('tips-updated', function(){
		setTotalPoints();
		setLevel(points);
		console.log("Points are: " + points + " and level is: " + level + " to level up, need: " + levelPoints);
		$rootScope.$emit("points-updated");
	});

	var setTotalPoints = function(){
		var tips = tip.tips();
		points = 0;
		for(var i = 0; i < tips.length; i++){
			points = points + tips[i].points;
		}
	};

	var setLevel = function(points){
		var needed = 0;
		level = 0;
		var remaining = points;
		while(remaining >= needed){
			level = level + 1;
			remaining = remaining - needed;
			needed = needed + 100;
		}
		levelPoints = remaining;
	};

	var api = {
		points: function(){
			return points;
		},
		level: function(){
			return level;
		},
		levelPoints: function(){
			return levelPoints;
		}
	};
	return api;

});
