app.factory('alarmdb', ['$http','$rootScope', function($http, $rootScope){
    	
    var obj={};

    obj.getSiteList = function(success, error){
        $http.get("/alarms/sitelist")
            .then(success, error);
    };

    obj.getCameraList = function(success, error){
        $http.get("/alarms/cameralist")
            .then(success, error);
    };
    			
	obj.getAlarms = function(conditions, success, error){
        var params = '';
        if (Object.keys(conditions).length > 0){
            params += '?';
            params += 'date=' + conditions.date.getTime() / 1000;
            if (conditions.sitename !== 'all'){
                params += '&sitename=' + conditions.sitename.replace(' ', '%20');
                if (conditions.camera !== 'all'){
                    // conditions.camera = { cameraname: **, sitename: ** }
                    params += '&cameraname=' + conditions.camera.replace(' ', '%20');
                }
            }
        }
		$http.get("/alarms" + params)
			.then(success, error);
    };

    obj.getNotHandledAlarms = function(success, error){
        $http.get("/alarms?handled=0")
            .then(success, error);
    };
        
    obj.markashandled = function (alarmid, success, error) {
        $http.put("/alarms/"+alarmid+"/handled")
		  .then(success, error);
    };

    return obj;

}]);



app.controller('tabcontroller', ["$scope", function($scope){
    $scope.tab = 'notHandled';
}]);


app.controller('alarmcontroller', ["$scope", '$rootScope', '$window', "alarmdb", 'alarmevents', 'device', '$window', '$translate', function($scope, $rootScope, $window, alarmdb, alarmevents, device, $window, $translate) {

    $scope.device = device;

    $scope.sortType = 'timestamp';
    $scope.sortReverse = true;

    $scope.currentalarm = undefined;
    $scope.selected = [];
    $scope.isSelectedAll = false;

    $scope.loading = true; // Displays loading wheel

    // We don't want to display all alarms at once, loading is too long
    var initialNbDisplayedAlarms = 20;
    var stepShowMoreAlarms = 20;
    $scope.limit = initialNbDisplayedAlarms;
    $scope.showmorealarms = function(){
        $scope.limit += stepShowMoreAlarms;
    };

    alarmdb.getSiteList(function success(response){
        console.log('Site list', response)
        $scope.sites = response.data;
    }, function error(response){
        $scope.logHttpError(response);
        $scope.sendnotification("NOTIF_ERROR_GETTING_SITE_LIST", false, 1);
    });

    alarmdb.getCameraList(function success(response){
        $scope.cameras = response.data;
    }, function error(response){
        $scope.logHttpError(response);
        $scope.sendnotification("NOTIF_ERROR_GETTING_CAMERA_LIST", false, 1);     
    });


    // Filters
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    $scope.filters = {
        sitename: 'all',
        camera: 'all',
        date: today
    };
    $scope.showfilters = false;
    // Stores current values, enables an easy form reset
    $scope.currentfilters = angular.copy($scope.filters);

    // Reset camera filter to 'all' when site is changed
    $scope.$watch('filters.sitename', function(newVal, oldVal){
        if (newVal !== oldVal){
            $scope.filters.camera = 'all';
        }
    });

    $scope.applyfilters = function(){
        $scope.loading = true;
        $scope.showfilters = false;
        $scope.limit = initialNbDisplayedAlarms; // Don't show all alarms at once
        $scope.currentalarm = undefined;
        $scope.currentfilters = angular.copy($scope.filters);
        alarmdb.getAlarms($scope.filters, function success(response){
            $scope.alarms = response.data;
            $scope.loading = false;
        }, function error(response){
            $scope.logHttpError(response);
            $scope.sendnotification("NOTIF_ERROR_GETTING_ALARMS", false, 1);
        });
    };

    $scope.resetfilters = function(){
        $scope.showfilters = false;
        $scope.filters = angular.copy($scope.currentfilters);
    };


    //  *** GETTING ALARMS LISTS ***
    // When this is executed (on page load), ng-init hasn't been run, 
    // so we don't know which tab we're working in yet
    $scope.cancelTabWatcher = $scope.$watch('tabName', function(newVal, oldVal){
        $scope.getAlarms();
    });

    $scope.getAlarms = function(){
        // ng-init has been run, stop watching tab changes
        $scope.cancelTabWatcher();

        if ($scope.tabName === 'notHandled'){

            alarmdb.getNotHandledAlarms(function success(response){
                $scope.alarms = response.data;
                $scope.loading = false;
            }, function error(response){
                $scope.logHttpError(response);
                $scope.sendnotification("NOTIF_ERROR_GETTING_ALARMS", false, 1);
            });

        } else if ($scope.tabName === 'filteredAlarms'){

            alarmdb.getAlarms($scope.filters, function success(response){
                $scope.alarms = response.data;
                $scope.loading = false;
            }, function error(response){
                $scope.logHttpError(response);
                $scope.sendnotification("NOTIF_ERROR_GETTING_ALARMS", false, 1);
            });

        }
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
        if (($scope.currentalarm !== undefined && $scope.currentalarm.id == alarmId) || $window.confirm($translate.instant("CONFIRM_HANDLE_ALARM"))) {
            if ($scope.currentalarm !== undefined && $scope.currentalarm.id == alarmId){
                var nextAlarm = $scope.getNextAlarm();
                if (nextAlarm !== -1){
                    $scope.currentalarm = $scope.alarms[nextAlarm];
                } else {
                    $scope.currentalarm = undefined; // No more alarms to show
                }
            }
            alarmdb.markashandled(alarmId, function success(resopnse){ 

            }, function error(response){
                $scope.logHttpError(response);
                $scope.sendnotification("NOTIF_ERROR_MARK_HANDLED", false, 1);
            });
        }
        $event.stopPropagation();
    };


    $scope.markcurrentashandled = function($event){
        $scope.markashandled($scope.currentalarm.id, $event);
    };


    $scope.shownextalarm = function(){
        var nextAlarm = $scope.getNextAlarm();
        console.log(nextAlarm);
        if (nextAlarm !== -1){
            var alarmid = $scope.alarms[nextAlarm].id;
            $scope.playalarm(alarmid);
        } else {
            $scope.currentalarm = undefined;
        }
    };

    $scope.showpreviousalarm = function(){
        var previousAlarm = $scope.getPreviousAlarm();
        if (previousAlarm !== -1){
            var alarmid = $scope.alarms[previousAlarm].id;
            $scope.playalarm(alarmid);
        } else {
            $scope.currentalarm = undefined;
        }
    };

    $scope.getNextAlarm = function(){
        var displayedAlarms = $scope.alarms.filter(function(a){
            return a.handled === 0;
        });
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
        var displayedAlarms = $scope.alarms.filter(function(a){
            return a.handled === 0;
        });
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
        if (window.confirm($translate.instant("CONFIRM_HANDLE_SELECTED"))){
            $scope.selected.forEach(function(alarmid){
                alarmdb.markashandled(alarmId, function success(resopnse){ 

                }, function error(response){
                    $scope.logHttpError(response);
                    $scope.sendnotification("NOTIF_ERROR_MARK_HANDLED", 
                        false, 
                        1);
                });
            });
        }
    };

    $scope.handleall = function(callback){
        // Copy the alarm list to avoid handling new alarms
        var alarms = [];
        $scope.alarms.forEach(function(a){
            alarms.push(a);
        });
        if ($window.confirm($translate.instant("CONFIRM_HANDLE_ALL"))){
            alarms.forEach(function(a){
                alarmdb.markashandled(a.id, function success(resopnse){ 

                }, function error(response){
                    $scope.logHttpError(response);
                    $scope.sendnotification("NOTIF_ERROR_MARK_HANDLED", 
                        false, 
                        1);
                });
            });
            $scope.currentalarm = undefined;
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
        if (camera === 'all'){
            return true;
        } else {
            var index = $scope.cameras.map(function(c){ return c.cameraname }).indexOf(camera.sitename);
            return $scope.cameras[index].sitename === $scope.filters.sitename;
        }
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


    // Alarm updates from server
    var alarmUpdate = function(event, data){
		var pos = $scope.alarms.map(function(e) { return e.id; }).indexOf(data.id);
        if (pos >= 0) {

            // Current alarm was markes as handled by another client
            if ($scope.currentalarm !== undefined 
                    && $scope.currentalarm.id == data.id 
                    && data.handled != 0){
                $window.alert($translate.instant("CONFIRM_HANDLED"));
                $scope.currentalarm = undefined;
            }

            if ($scope.tabName === 'notHandled'){
                $scope.alarms.splice(pos, 1);
            } else {
                $scope.alarms[pos] = data;
            }
            console.log($scope.tabName);
            console.log($scope.alarms.length);
            if ($scope.selected.indexOf(data.id) >= 0){
                $scope.selected.splice($scope.selected.indexOf(data.id), 1);
            }
        } else {
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
        replace: true
    };

});

app.directive('imagewithosd', function(){
    return {
        restrict: 'E',
        scope:{image:"=", osd:"="},
        replace: true,
        template: '<canvas class="imagecanvas"/>',
        link: function(scope, elem, attrs){

            var canvas = elem[0];
            canvas.setAttribute('width', 800);
            canvas.setAttribute('height', 600);

            function repaintImage(){

                var ctx = canvas.getContext("2d");
                ctx.width = 800;
                ctx.height = 600;

                if (scope.image && scope.image.naturalWidth && scope.image.naturalWidth > 0 && scope.image.naturalHeight > 0){

                    var hRatio = ctx.width / scope.image.naturalWidth;
                    var vRatio = ctx.height / scope.image.naturalHeight;
                    var ratio = Math.min(hRatio, vRatio);
                    var shiftX = (ctx.width - scope.image.naturalWidth * ratio) / 2;
                    var shiftY = (ctx.height - scope.image.naturalHeight * ratio) / 2;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(scope.image, 0, 0, scope.image.naturalWidth, scope.image.naturalHeight,
                                                shiftX, shiftY, scope.image.naturalWidth * ratio, scope.image.naturalHeight * ratio);

                    if (scope.osd){
                        for (var i = 0; i < scope.osd.length; i++) {
                            var points = scope.osd[i];
                            
                            ctx.lineWidth = "2";
                            ctx.strokeStyle = "red";

                            ctx.beginPath();
                            ctx.moveTo(points[0].x * canvas.width / scope.image.width, points[0].y * canvas.height / scope.image.height);
                            for (var j = 0; j < points.length; j++)
                                ctx.lineTo(points[j].x * canvas.width / scope.image.width, points[j].y * canvas.height / scope.image.height);
                            ctx.closePath();
                            ctx.stroke();
                        }

                    }

                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

            }
              
            scope.$watch('image', function(newVal, oldVal){
                repaintImage();
            });
            scope.$watch('osd', function(newVal, oldVal){
                repaintImage();
            });

        }

    };
});

app.directive('imageplayer', ["$http","$interval", "$timeout", function($http, $interval, $timeout) {
  return {
	  restrict: 'E',
	  scope:{alarm:"=", imgwidth:"@", imgheight:"@"},
	  replace: true,
	  templateUrl: '/imageplayer',
	  link: function(scope, elem, attrs){
            scope.rootElement = elem;
            scope.loading = false;
            scope.currentIdx = 0;
            scope.showOsd = true;
            scope.playing = false;
            scope.showcontrols = true;
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
                if (!newVal) return;
                scope.playing = false;
                scope.loading = true;
                LoadImages($http, newVal, function () {
                    $timeout(function () {
                        scope.loading = false;
                        scope.playing = true;
                        scope.currentIdx = 0;
                    }, 0);
                });
            });

        }

    };
}]);














