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

.factory("tip", function($http, $rootScope, $q, category, notification){
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
			tx.executeSql('select * from tips where created=(select max(created) from tips where id != 16);', [], function(tx, res) {
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

	var createTip = function(id){
		var d = $q.defer();
		var db = window.sqlitePlugin.openDatabase({name: "categories"});
		var timeString = new Date().toISOString();
		db.transaction(function(tx) {
			tx.executeSql('INSERT INTO tips (id, shown, points, created, modified) VALUES (?,?,?,?,?);', [id, true, 0, timeString, timeString], function(tx, res) {
				d.resolve(true);
			});
		});
		return d.promise;
	};

	var selectDailyTip = function(){
		getLastTip().then(function(lastTip){
			var time = new Date();
			var notificationTime = notification.getNotificationTime().then(function(notificationTime){
				console.log("The last tip is", lastTip);
				if(lastTip.created !== undefined){
					var hourDiff = getHourDiff(lastTip.created);
					console.log("Hour diff from last tip to now is " + hourDiff);
				} else {
					console.log("No daily tip found yet, setting one now.");
					hourDiff = 24;
				}
				if((hourDiff >= 24) || (hourDiff > 1 && ((time - notificationTime) / (1000 * 60 * 60)) < 1)){
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
				if(tips[i].shown === true && tips[i].id !== tip.id){
					shown.push(tips[i]);
				}
			}
			return shown;
		},
		getTipIndexById: function(id){
			return getTipIndexById(id);
		},
		createTip: function(id){
			return createTip(id);
		}
	};
	return api;

})

.factory("level", function($http, $rootScope, $q, point){
	var level = 1;
	var nextLevel = 2;
	var pointsPerLevelMultiplier = 100;
	var pointsForCurrentLevel = level * pointsPerLevelMultiplier;
	var pointsForNextLevel = nextLevel * pointsPerLevelMultiplier;
	var remainingPoints;
	function setLevel(points){ // loops over the number of points acquired and
		remainingPoints = points - pointsForCurrentLevel;
		// loop over levels, starting with 1, and multiplying by 10
		for (;remainingPoints > pointsForCurrentLevel;){
			pointsForCurrentLevel = level * pointsPerLevelMultiplier;
			remainingPoints -= pointsForCurrentLevel;
			level += 1;
			pointsForNextLevel = level * pointsPerLevelMultiplier;
		}
		$rootScope.$emit("level-updated",level);
	};

	$rootScope.$on('points-updated',function (event, points) {
		console.log('points-updated ',typeof points,points);
		return;
		setLevel(points);
	});

	var api = {
		level:function () {
			return level;
		},
		pointsForNextLevel:function () {
			return pointsForNextLevel;
		}
	}
	return api;
})

.factory("point", function($http, $rootScope, $q, tip){
	var points = 0;
	$rootScope.$on('tips-updated', function(){
		setTotalPoints(); //set total points from all person's historical tips
		// setLevel(points); //
		console.log("Points are: " + points);
		$rootScope.$emit("points-updated",points);
	});

	function setTotalPoints (){
		angular.forEach(tip.tips(),function (tipObj,i) {
			points += tipObj.points;
		});
	};

	var api = {
		points: function(){
			return points;
		}
	};
	return api;

})

.factory('notification', function(storage, $q){

	var getNotificationTime = function(){
		var d = $q.defer();
		var dateString = new Date().toDateString();
		var time = storage.get('time').then(function(val){
			var date;
			console.log("Got time " + time + " for notification");
			if(time !== undefined){
				date = new Date(dateString + " " + time);
			}
			d.resolve(date);
		});
		return d.promise;
	};

	var setNotification = function(){
		var d = $q.defer();
		getNotificationTime().then(function(date){
			if(date !== undefined){
				window.plugin.notification.local.add({
					id:         1,  // A unique id of the notifiction
					date:       date,    // This expects a date object
					message:    "A new tip is waiting for you!",  // The message that is displayed
					title:      "New daily tip!",  // The title of the message
					repeat:     'daily',  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
					autoCancel: true, // Setting this flag and the notification is automatically canceled when the user clicks it
					ongoing: false // Prevent clearing of notification (Android only)
				});
			}
			d.resolve(true);
		});
		return d.promise;
	};

	var api = {
		setNotification: function(){
			return setNotification();
		},
		getNotificationTime: function(){
			return getNotificationTime();
		}
	};
	return api;
})

.factory('storage', function($q){

	var setValue = function(key, val){
		var d = $q.defer();
		window.plugins.appPreferences.store(
			function(){
				console.log("Saved value for " + key + " and " + val);
				d.resolve(true);
			},
			function(){
				console.log("Couldn't save value for " + key + " and " + val);
				d.resolve(false);
			},
			key,
			val
		);
		return d.promise;
	};

	var getValue = function(key){
		var d = $q.defer();
		window.plugins.appPreferences.fetch(
			function(val){
				console.log("Got value for " + key + " and " + val);
				d.resolve(val);
			},
			function(){
				console.log("Couldn't get value for " + key);
				d.resolve(undefined);
			},
			key
		);
		return d.promise;
	};

	var api = {
		set: function(key, val){
			return setValue(key, val);
		},
		get: function(key){
			return getValue(key);
		}
	};
	return api;
})

.factory('toast', function($q){
	var showToast = function(message){
		window.plugins.toast.showLongBottom(
			message,
			function(a){
				console.log('Showed toast message: ' + a)
			},
			function(b){
				alert('Could not show toast message: ' + b)
			}
		)
	};

	var api = {
		show: function(message){
			return showToast(message);
		}
	};
	return api;
});