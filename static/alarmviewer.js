
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

        obj.delete = function(alarmid, callback){
            $http.delete("/controller/alarm/"+alarmid)
                .success(function (data){ callback(null, data); })
                .error(function(data){ callback({response: data}); });
        };

        return obj;
}]);

app.controller('alarmcontroller', ["$scope", '$rootScope', '$window', "alarmdb", 'alarmevents', function($scope, $rootScope, $window, alarmdb, alarmevents) {
    
    $scope.currentalarm=undefined;
    
    alarmdb.getalarms(function(data){ $scope.alarms=data;});        
    
    $scope.playalarm=function(alarmId){
        if (!mobile){ // Alarm are played automatically in mobile version
            var pos=$scope.alarms.map(function(e) { return e.id; }).indexOf(alarmId);
            $scope.currentalarm = pos==-1?undefined:$scope.alarms[pos];
        }
    };
        
    $scope.markashandled = function (alarmId){
        if (($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId) || $window.confirm("Are you sure you wat to validate the alarm?")) {
            if ($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId)
                $scope.currentalarm = undefined;
            alarmdb.markashandled(alarmId, function (err) { });
        }
    };        

    $scope.delete = function (alarmId){
        if (($scope.currentalarm != undefined && $scope.currentalarm.id == alarmId) || $window.confirm("Are you sure you wat to delete the alarm?")) {
            alarmdb.delete(alarmId, function(err){ });
        }
    }        
    
    var alarmUpdate=function(event, data){		
		var pos=$scope.alarms.map(function(e) { return e.id; }).indexOf(data.id);
		
        if (pos >= 0) {
            if ($scope.currentalarm != undefined && $scope.currentalarm.id == data.id && data.handled != 0)
                $window.alert("Current alarm was marked as handled.");
            $scope.alarms[pos] = data;
        }
		else
			$scope.alarms.push(data);
		
	};

    var deleteAlarm = function(event, alarmid){
        var pos=$scope.alarms.map(function(e) { return e.id; }).indexOf(alarmid);

        if ($scope.currentalarm != undefined && $scope.currentalarm.id == alarmid){
            $window.alert("Current alarm was deleted.");
        }

        $scope.alarms.splice(pos, 1);
    }
    
    var unbind1 = $rootScope.$on("alarm_create",alarmUpdate);
    var unbind2 = $rootScope.$on("alarm_update", alarmUpdate);
    var unbind2 = $rootScope.$on("alarm_deleted", deleteAlarm);

    $scope.$on('$destroy', function () { unbind1(); unbind2(); });
}]);


app.directive('imageplayer', ["$http","$interval", "$timeout", function($http, $interval, $timeout) {
  return {
	  restrict: 'E', 
	  scope:{alarm:"=", imgwidth:"@", imgheight:"@"},
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
               if (!newVal) return;

               scope.playing = false;
               scope.loading = true;    	                 
                LoadImages($http, newVal, function () {
                    $timeout(function () {// a timeout is needed aw we can be called from a non http context
                        scope.loading = false;
                        scope.playing = true;
                        scope.currentIdx = 0;
                    }, 0);                                     
               });
		  });
	  }
  };
}]);

app.directive('imagewithosd', function() {
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
			  
                if (!scope.image) {
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

