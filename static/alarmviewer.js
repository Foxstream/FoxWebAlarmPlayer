app.factory('alarmdb', ['$http','$rootScope',
    function($http, $rootScope){
    	var obj={};

        obj.getSiteList = function(callback){
            $http.get("/controller/alarms/sitelist")
                .success(callback)
                .error(function(){callback(null);});
        };

        obj.getCameraList = function(callback){
            $http.get("/controller/alarms/cameralist")
                .success(callback)
                .error(function(){callback(null);});
        };
    			
    	obj.getAlarms = function(conditions, callback){
            var params = '?';
            params += 'date=' + conditions.date.getTime() / 1000;
            if (conditions.sitename !== 'Tous'){
                params += '&sitename=' + conditions.sitename.replace(' ', '%20');
                if (conditions.camera !== 'Toutes'){
                    // conditions.camera = { cameraname: **, sitename: ** }
                    params += '&cameraname=' + conditions.camera.replace(' ', '%20');
                }
            }
            console.log('Request : /controller/alarms' + params);
    		$http.get("/controller/alarms" + params)
    			.success(callback)
    			.error(function(){callback(null);});
        };


        obj.getNotHandledAlarms = function(callback){
            $http.get("/controller/alarms/nothandled")
                .success(callback)
                .error(function(){callback(null);});
        };
            
        obj.markashandled = function (alarmid, callback) {
            $http.put("/controller/alarm/"+alarmid+"/markashandled")
    		  .success(callback)
    		  .error(function (data) { callback({response: data}); });
        };

        return obj;
}]);


app.controller('tabcontroller', ["$scope", function($scope){
    $scope.tab = 'notHandled';
}]);


app.controller('alarmcontroller', ["$scope", '$rootScope', '$window', "alarmdb", 'alarmevents', 'device', function($scope, $rootScope, $window, alarmdb, alarmevents, device) {

    $scope.device = device;
    
    $scope.sortType = 'timestamp';
    $scope.sortReverse = true;

    $scope.currentalarm = undefined;
    $scope.selected = [];
    $scope.isSelectedAll = false;

    $scope.loading = true; // Displays loading wheel

    $scope.limit = 30;
    $scope.limitStep = 20;
    $scope.showmorealarms = function(){
        $scope.limit += $scope.limitStep;
    };

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    $scope.debug = '';
    alarmdb.getSiteList(function(data){
        $scope.sites = ["Tous"].concat(data);
        console.log('Liste des serveurs :', $scope.sites);
    });

    $scope.cameras = [{cameraname: 'Toutes', sitename: 'all'}];
    alarmdb.getCameraList(function(data){
        $scope.debug += "Liste des caméras " + new Date().getTime();
        $scope.cameras = $scope.cameras.concat(data);
    });

    $scope.filters = {
        sitename: 'Tous',
        camera: 'Toutes',
        date: today
    };
    // Stores current values, enables an easy form reset
    $scope.currentfilters = angular.copy($scope.filters);

    $scope.$watch('filters.sitename', function(newVal, oldVal){
        if (newVal !== oldVal){
            $scope.filters.camera = 'Toutes';
        }
    });

    $scope.applyfilters = function(){
        $scope.loading = true;
        $scope.limit = 30;
        $scope.currentfilters = angular.copy($scope.filters);
        alarmdb.getAlarms($scope.filters, function(data){
            $scope.alarms = data;
            $scope.loading = false;
        });
    };

    $scope.resetfilters = function(){
        $scope.showfilters = false;
        $scope.filters = angular.copy($scope.currentfilters);
    };

    /* When this is executed for the first time, ng-init hasn't been run, so we don't know which tab we're working in yet */
    $scope.cancelTabWatcher = $scope.$watch('tabName', function(newVal, oldVal){
        $scope.getAlarms();
    });

    $scope.getAlarms = function(){
        if ($scope.tabName === 'notHandled'){
            alarmdb.getNotHandledAlarms(function(data){
                $scope.alarms = data;
                $scope.loading = false;
            });
        } else if ($scope.tabName === 'filteredAlarms'){
            alarmdb.getAlarms($scope.filters, function(data){
                $scope.alarms = data;
                $scope.loading = false;
            });
        }
        $scope.cancelTabWatcher();
    };


    $scope.playalarm = function(alarmid){
        // Mobile devices : if the user clicked on alarm while the filter pop-up was visible, make sure that it is hidden when going back to alarm list
        $scope.showfilters = false;
        $scope.resetfilters();

        var pos = $scope.alarms.map(function(e){ return e.id; }).indexOf(alarmid);
        var selectedAlarm = (pos==-1) ? undefined : $scope.alarms[pos];
        $scope.currentalarm = selectedAlarm;
    };
        

    $scope.markashandled = function (alarmId, $event){
        if (($scope.currentalarm !== undefined && $scope.currentalarm.id == alarmId) || $window.confirm("Voulez-vous vraiment acquitter cette alarme ?")) {
            if ($scope.currentalarm !== undefined && $scope.currentalarm.id == alarmId){
                var previousAlarm = $scope.getPreviousAlarm();
                if (previousAlarm !== -1){
                    $scope.currentalarm = $scope.alarms[previousAlarm];
                } else {
                    $scope.currentalarm = undefined;
                }
            }
            alarmdb.markashandled(alarmId, function (err) { });
        }
        $event.stopPropagation();
    };


    $scope.markcurrentashandled = function($event){
        $scope.markashandled($scope.currentalarm.id, $event);
    };


    $scope.shownextalarm = function(){
        var nextAlarm = $scope.getNextAlarm();
        if (nextAlarm !== -1){
            var alarmid = $scope.alarms[nextAlarm].id;
            $scope.playalarm(alarmid);
        }
    };

    $scope.showpreviousalarm = function(){
        var previousAlarm = $scope.getPreviousAlarm();
        if (previousAlarm !== -1){
            var alarmid = $scope.alarms[previousAlarm].id;
            $scope.playalarm(alarmid);
        }
    };

    $scope.getNextAlarm = function(){
        var displayedAlarms = $scope.alarms;
        if (displayedAlarms.length < 2){
            return -1;
        } else {
            var position = displayedAlarms.map(function(a){ return a.id; }).indexOf($scope.currentalarm.id);
            if (position === displayedAlarms.length - 1){
                return 0;
            } else {
                return position + 1;
            }
        }
    };

    $scope.getPreviousAlarm = function(){
        var displayedAlarms = $scope.alarms;
        if (displayedAlarms.length < 2){
            return -1;
        } else {
            var position = displayedAlarms.map(function(a){ return a.id; }).indexOf($scope.currentalarm.id);
            if (position === 0){
                return displayedAlarms.length - 1;
            } else {
                return position - 1;
            }
        }
    };


    $scope.handleSelected = function(){
        if (window.confirm("Voulez-vous vraiment acquitter ces " + $scope.selected.length +" alarmes ?")){
            $scope.selected.forEach(function(alarmid){
                alarmdb.markashandled(alarmid, function(err){});
            });
        }
    };

    $scope.handleall = function(callback){
        // Copy the alarm list to avoid handling new alarms
        var alarms = [];
        $scope.alarms.forEach(function(a){
            alarms.push(a);
        });
        if (window.confirm('Êtes vous sûr de vouloir acquitter toutes les alarmes ?')){
            alarms.forEach(function(a){
                alarmdb.markashandled(a.id, function(err){  });
            });
            $scope.currentalarm = undefined;
        }
    };

    $scope.delete = function (alarmId){
        if (($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId) || $window.confirm("Êtes-vous sûr de vouloir acquiter cette alarme ??")) {
            alarmdb.delete(alarmId, function(err){ });
        }
    };

    $scope.isSelected = function(id){
        return $scope.selected.indexOf(id) >= 0;
    };

    $scope.updateSelection = function(id, event){
        event.stopPropagation();
        if($scope.isSelected(id)){
            $scope.selected.splice($scope.selected.indexOf(id), 1);
            if ($scope.isSelectedAll) $scope.isSelectedAll = false;
        } else {
            $scope.selected.push(id);
            if ($scope.selected.length === $scope.alarms.length){
                $scope.isSelectedAll = true;
            }
        }
    };

    $scope.selectall = function(){
        if ($scope.isSelectedAll){
            $scope.selected = [];
        } else {
            $scope.alarms.forEach(function(a){
                if ($scope.selected.indexOf(a.id) < 0){
                    $scope.selected.push(a.id);
                }
            });
        }
        $scope.isSelectedAll = !($scope.isSelectedAll);
    };

    // Used in filter select input
    // Gets the cameras for the currently selected site
    $scope.camerasForCurrentSite = function(camera){
        return camera.sitename === $scope.filters.sitename || camera.sitename === 'all';
    };


    $scope.getNotHandledAlarms = function(){
        if ($scope.alarms){
            return $scope.alarms.filter(function(a){
                return a.handled === 0;
            });
        } else {
            return [];
        }
    };

    var alarmUpdate = function(event, data){
		var pos = $scope.alarms.map(function(e) { return e.id; }).indexOf(data.id);
        if (pos >= 0) {
            if ($scope.currentalarm !== undefined && $scope.currentalarm.id == data.id && data.handled != 0){
                $window.alert("Current alarm was marked as handled.");
                $scope.currentalarm = undefined;
            }
            if (data.handled != 0){
                $scope.sendnotification("Alarme acquittée", true, 1);
            }
            $scope.alarms[pos] = data;
            if ($scope.selected.indexOf(data.id) >= 0){
                $scope.selected.splice($scope.selected.indexOf(data.id), 1);
            }
        }
		else {
            $scope.limit++;
            if ($scope.tabName === 'notHandled'){
                $scope.alarms.push(data);
            }
        }
		
	};

    var unbind1 = $rootScope.$on("alarm_create", alarmUpdate);
    var unbind2 = $rootScope.$on("alarm_update", alarmUpdate);

    $scope.$on('$destroy', function () { unbind1(); unbind2(); });

}]);



app.directive('swiper', function(){

    return {
        templateUrl: '/swiper',
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs){

            // var currentPosition = 0;
            // var maxPosition = 0;

            // scope.$watchCollection('alarms', function(){  
            //      if (scope.currentalarm !== undefined){
            //         var position = scope.alarms.map(function(a){
            //             return a.id;
            //         }).indexOf(scope.currentalarm.id);
            //         var offset = -position * 100;
            //         $(element).find('.slides-container').animate({
            //             left: offset+"%"
            //         }, 100);
            //         currentPosition = offset;
            //     }
            // });

            // scope.$watch('currentalarm', function(){
            //     if (scope.currentalarm !== undefined){
            //         var position = scope.alarms.map(function(a){
            //             return a.id;
            //         }).indexOf(scope.currentalarm.id);
            //         var offset = -position * 100;
            //         $(element).find('.slides-container').animate({
            //             left: offset+"%"
            //         }, 500);
            //         currentPosition = offset;
            //     }
            // });

        }
    };

});



app.directive('imageplayer', ["$http","$interval", "$timeout", function($http, $interval, $timeout) {
  return {
	  restrict: 'E', 
	  scope:{alarm:"=", imgwidth:"@", imgheight:"@", isvisible: "="},
	  replace: true,
	  templateUrl: '/imageplayer',
	  link: function(scope, elem, attrs){
            scope.rootElement = elem;
            scope.loading = false;
            scope.currentIdx = 0;
            scope.showOsd = true;
            scope.playing = false;
            scope.interval;

            scope.toggleOsd = function () {
                scope.showOsd = !scope.showOsd;
            };

            scope.nextImage = function (){
                if(scope.alarm && scope.alarm.nbimages)
                    // scope.currentIdx = 1;
                    scope.currentIdx = (scope.currentIdx + 1) % scope.alarm.nbimages;
            };

            scope.prevImage = function (){
                if (scope.alarm && scope.alarm.nbimages)
                    scope.currentIdx = (scope.currentIdx - 1 + scope.alarm.nbimages) % scope.alarm.nbimages;
            };

            scope.$watch('playing', function(newVal, oldVal){
                if (newVal === oldVal) return;
                if (newVal){
                    scope.interval = $interval(function () { 
                        scope.nextImage();
                    }, 500);
                } else {
                    $interval.cancel(scope.interval);
                }
            });
		  
            scope.$watch('alarm', function (newVal, oldVal){
                if (newVal === oldVal) return;
                if (!newVal) return
                scope.playing = false;
                scope.loading = true;
                if (scope.isvisible){
                    console.log('Loading images');
                    LoadImages($http, newVal, function () {
                        $timeout(function () {
                            scope.loading = false;
                            scope.playing = true;
                            scope.currentIdx = 0;
                        }, 0);
                    });
                }
            });

            scope.$watch('isvisible', function (newVal, oldVal){
                if (!scope.alarm || newVal === oldVal) return;
                    if (newVal){
                        scope.playing = false;
                        scope.loading = true;
                        LoadImages($http, scope.alarm, function () {
                            $timeout(function () {
                                scope.loading = false;
                                scope.playing = true;
                                scope.currentIdx = 0;
                            }, 0);
                        });
                    } else { // Stop playing
                        scope.playing = false;
                    }
            });

        }

    };
}]);