app.factory('live', ['$http','$rootScope',
    function($http, $rootScope){    
   
        var obj = {};

        obj.getCameras = function(callback){
            $http.get('/controller/live/cameras')
            .success(callback)
            .error(function(){ callback(null); });
        }

        obj.getLiveImage = function(serverId, camId, callback){
            $http.get('/controller/live/' + serverId + '/' + camId)
            .success(function(image){
                callback('data:image/jpeg;base64,' + image);
            })
            .error(function(err){ 
                callback('/static/img/no_video.png');
            });
        }

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", "device", function($scope, $rootScope, $window, live, device) {
    
    $scope.selectedcamera;

    $scope.device = device;

    live.getCameras(function(cameras){
        $scope.cameras = cameras;
        for (var site in $scope.cameras){
            $scope.cameras[site].forEach(function(cam){
                live.getLiveImage(cam.serverId, cam.camid, function(image){
                    cam.image = image;
                });
            });
        }
    });

    $scope.playlivefeed = function(site, serverId, camId, fps){
        $scope.currentsite = site;
        $scope.selectedcamera = {
            server: serverId,
            camId: camId,
            fps: fps
        };
    }

    // LIVE PICTURES
    // setInterval(function(){
    //     if ($scope.cameras){
    //         for (var site in $scope.cameras){
    //             $scope.cameras[site].forEach(function(cam){
    //                 live.getLiveImage(cam.serverId, cam.camid, function(image){
    //                     cam.image = image;
    //                 });
    //             });
    //         }
    //     }
    // }, 40);

}]);

app.directive('liveplayer', ["$http","$interval", "$timeout", "live", function($http, $interval, $timeout, live) {
  return {
      restrict: 'E',
      scope:{imgwidth:"@", imgheight:"@", playing: "@", camera: "="},
      replace: true,
      templateUrl: '/liveplayer',
      link: function(scope, elem, attrs) {
            scope.showOsd = true;
            scope.playing = true;
            scope.liveInterval;
            scope.image = 'image';

            scope.toggleOsd = function () {
                scope.showOsd = !scope.showOsd;
            }
            scope.$watch('camera', function (newVal, oldVal){
                if (newVal === oldVal) return;
                if (scope.liveInterval){
                    clearInterval(liveInterval);
                }

                liveInterval = setInterval(function(){
                    live.getLiveImage(scope.camera.server, scope.camera.camId, function(image){
                        scope.image = image;
                        console.log(image);
                    });
                }, 1000);

          }, true);
      }
  };
}]);


app.directive('liveswiper', function(){

    return {
        templateUrl: '/liveswiper',
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs){

            var currentPosition = 0;
            var maxPosition = 0;

            scope.$watch('selectedcamera', function(){
                if (scope.selectedcamera !== undefined){
                    var position = scope.cameras[scope.currentsite].map(function(c){
                        return c.camid;
                    }).indexOf(scope.selectedcamera.camId);
                    var offset = -position * 100;
                    $(element).find('.slides-container').animate({
                        left: offset+"%"
                    }, 500);
                    currentPosition = offset;
                }
            });

        }
    }

});


