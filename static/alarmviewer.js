
app.filter('asdate', function (){
   function zerofill(v)
   {
        return (v <= 9)?'0'+v:'' + v;
   }
   return function(input){
	   var a=new Date(input*1000);
       return a.getFullYear()+'/'+ zerofill(a.getMonth())+'/'+ zerofill(a.getDate())+" - "+ zerofill(a.getHours())+":"+ zerofill(a.getMinutes())+":"+ zerofill(a.getSeconds());
   }
});


app.factory('alarmdb', ['$http','$rootScope',
    function($http, $rootScope){
    	var obj={}
    			
    	obj.getalarms=function(callback)
    	{
    		$http.get("/controller/alarms/handled")
    			.success(callback)
    			.error(function(){callback(null);});				
        };
            
        obj.markashandled = function (alarmid, callback) {
            $http.put("/controller/alarm/"+alarmid+"/markashandled")
    		  .success(function (data) { callback(null, data); })
    		  .error(function (data) { callback({response: data}); });
        };	

        return obj;
}]);

app.controller('alarmcontroller', ["$scope", '$rootScope', '$window', "alarmdb", 'alarmevents', 'device', function($scope, $rootScope, $window, alarmdb, alarmevents, device) {
    
    $scope.currentalarm=undefined;
    $scope.selected = [];
    $scope.isSelectedAll = false;

    alarmdb.getalarms(function(data){
        $scope.alarms = data; });
    
    $scope.playalarm = function(alarmid){
        var pos = $scope.alarms.map(function(e) { return e.id; }).indexOf(alarmid);
        var selectedAlarm = (pos==-1) ? undefined : $scope.alarms[pos];
        $scope.currentalarm = selectedAlarm;
    }
        
    $scope.markashandled = function (alarmId, $event){
        if (($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId) || $window.confirm("Are you sure you wat to validate the alarm?")) {
            if ($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId){
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
    }

    $scope.shownextalarm = function(){
        var nextAlarm = $scope.getNextAlarm();
        if (nextAlarm !== -1){
            var alarmid = $scope.alarms[nextAlarm].id;
            $scope.playalarm(alarmid);
        }
    }

    $scope.showpreviousalarm = function(){
        var previousAlarm = $scope.getPreviousAlarm();
        if (previousAlarm !== -1){
            var alarmid = $scope.alarms[previousAlarm].id;
            $scope.playalarm(alarmid);
        }
    }

    $scope.getNextAlarm = function(){
        var nextAlarm;
        var notHandled = $scope.getNotHandledAlarms();
        if (notHandled.length < 2){
            return -1;
        } else {
            var position = notHandled.map(function(a){ return a.id; }).indexOf($scope.currentalarm.id);
            if (position === notHandled.length - 1){
                nextAlarm = 0;
            } else {
                nextAlarm = position + 1;
            }
            return $scope.alarms.map(function(a){ return a.id }).indexOf(notHandled[nextAlarm].id);
        }
    }

    $scope.getPreviousAlarm = function(){
        var previousAlarm;
        var notHandled = $scope.getNotHandledAlarms();
        if (notHandled.length < 2){
            return -1;
        } else {
            var position = notHandled.map(function(a){ return a.id; }).indexOf($scope.currentalarm.id);
            if (position === 0){
                previousAlarm = notHandled.length - 1;
            } else {
                previousAlarm = position - 1;
            }
            return $scope.alarms.map(function(a){ return a.id }).indexOf(notHandled[previousAlarm].id);
        }
    }

    $scope.handleSelected = function(){
        if (window.confirm("Êtes-vous sûr de vouloir acquitter " + $scope.selected.length +" alarmes ?")){
            $scope.selected.forEach(function(alarmid){
                alarmdb.markashandled(alarmid);
            });
        }
    }

    $scope.handleall = function(callback){
        // Copy the alarm list to avoid handling new alarms
        var alarms = [];
        $scope.alarms.forEach(function(a){
            alarms.push(a);
        });
        if (window.confirm('Êtes vous sûr de vouloir acquitter toutes les alarmes ?')){
            alarms.forEach(function(a){
                alarmdb.markashandled(a.id);
            });
            $scope.currentalarm = undefined;
        }
    }     

    $scope.delete = function (alarmId){
        if (($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId) || $window.confirm("Êtes-vous sûr de vouloir acquiter cette alarme ??")) {
            alarmdb.delete(alarmId, function(err){ });
        }
    }

    $scope.isSelected = function(id){
        return $scope.selected.indexOf(id) >= 0;
    }

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
    }

    $scope.selectAll = function(){
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
    }

    $scope.getNotHandledAlarms = function(){
        return $scope.alarms.filter(function(a){
            return a.handled === 0;
        });
    }


    var alarmUpdate = function(event, data){
		var pos = $scope.alarms.map(function(e) { return e.id; }).indexOf(data.id);
        if (pos >= 0) {
            if ($scope.currentalarm != undefined && $scope.currentalarm.id == data.id && data.handled != 0){
                $window.alert("Current alarm was marked as handled.");
                $scope.currentalarm = undefined;
            }
            $scope.alarms[pos] = data;
            if ($scope.selected.indexOf(data.id) >= 0){
                $scope.selected.splice($scope.selected.indexOf(data.id), 1);
            }
        }
		else
			$scope.alarms.push(data);
		
	}

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

            var currentPosition = 0;
            var maxPosition = 0;

            scope.$watchCollection('alarms', function(){  
                 if (scope.currentalarm !== undefined){
                    var position = scope.getNotHandledAlarms().map(function(a){
                        return a.id;
                    }).indexOf(scope.currentalarm.id);
                    var offset = -position * 100;
                    $(element).find('.slides-container').animate({
                        left: offset+"%"
                    }, 100);
                    currentPosition = offset;
                }
            });

            scope.$watch('currentalarm', function(){
                // Position the slider on the right alarm
                if (scope.currentalarm !== undefined){
                    var position = scope.getNotHandledAlarms().map(function(a){
                        return a.id;
                    }).indexOf(scope.currentalarm.id);
                    var offset = -position * 100;
                    $(element).find('.slides-container').animate({
                        left: offset+"%"
                    }, 500);
                    currentPosition = offset;
                }
            });

            $(element).on("swipeleft", function(){
                var notHandled = scope.getNotHandledAlarms();
                var minPosition = -(notHandled.length - 1) * 100;
                if (currentPosition > minPosition){
                    scope.shownextalarm();
                }
            });

            $(element).on("swiperight", function(){
                if (currentPosition < 0){
                    scope.showpreviousalarm();
                }
            });

        }
    }

});



app.directive('imageplayer', ["$http","$interval", "$timeout", function($http, $interval, $timeout) {
  return {
	  restrict: 'E', 
	  scope:{alarm:"=", imgwidth:"@", imgheight:"@", playing: "@"},
	  replace: true,
	  templateUrl: '/imageplayer',
	  link: function(scope, elem, attrs) {
            scope.rootElement = elem;
            scope.loading = false;
            scope.currentIdx = 0;
            scope.playing = false;
            scope.showOsd = true;
                
            scope.toggleOsd = function () {
                scope.showOsd = !scope.showOsd;
            }

            scope.nextImage = function (){
                if(scope.alarm && scope.alarm.nbimages)
                    scope.currentIdx = (scope.currentIdx + 1) % scope.alarm.nbimages;
            }
            scope.prevImage = function () {
                if (scope.alarm && scope.alarm.nbimages)
                    scope.currentIdx = (scope.currentIdx - 1 + scope.alarm.nbimages) % scope.alarm.nbimages;
            }

            $interval(function () { if (scope.playing) scope.nextImage(); }, 500);
		  
            scope.$watch('alarm', function (newVal, oldVal){
               if (newVal === oldVal) return;

               scope.playing = false;
               scope.loading = true;
                LoadImages($http, newVal, function () {
                    $timeout(function () {// a timeout is needed aw we can be called from a non http context
                        scope.loading = false;
                        // scope.playing = true;
                        scope.currentIdx = 0;
                    }, 0);
               });
		  });
	  }
  };
}]);

app.directive('imagewithosd', function(){
  return {
	  restrict: 'E', 
	  scope:{image:"=", osd:"=", imgwidth:"@", imgheight:"@"},
	  replace: true,
	  template: '<canvas class="imagecanvas"/>',
	  link: function(scope, elem, attrs) {
		  var canvas = elem[0];
		  
		  function repaintImage()
		  {
			  var ctx=canvas.getContext("2d");
			  canvas.width = scope.imgwidth;
			  canvas.height = scope.imgheight;
			  
                if (!scope.image){
                    ctx.fillStyle = "grey";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                else {
                    ctx.drawImage(scope.image, 0, 0, canvas.width, canvas.height);
                    if (scope.osd) {
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
                }
		  }
		  
          scope.$watch('image', repaintImage);
          scope.$watch('osd', repaintImage);
		  repaintImage();
	  }
  };
});

