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

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", function($scope, $rootScope, $window, live) {
    
    $scope.selectedcamera;

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

    $scope.playlivefeed = function(serverId, camId, fps){
        $scope.selectedcamera = [serverId, camId, fps];
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
            // scope.rootElement = elem;
            // scope.loading = false;
            scope.showOsd = true;
            scope.playing = true;
            scope.liveInterval;
            scope.image;

            scope.toggleOsd = function () {
                scope.showOsd = !scope.showOsd;
            }
            scope.$watch('camera', function (newVal, oldVal){
                console.log(scope.camera);
                if (newVal === oldVal) return;

               if (scope.liveInterval){
                    clearInterval(liveInterval);
                }

                liveInterval = setInterval(function(){
                    live.getLiveImage(scope.camera[0], scope.camera[1], function(image){
                        scope.image = image;
                    });
                }, 1000);

          }, true);
      }
  };
}]);




