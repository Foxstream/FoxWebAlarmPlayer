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
    
    $scope.liveImage = '/static/img/no_video.png';
    var liveInterval;

    live.getCameras(function(cameras){
        $scope.cameras = cameras;
        for (var site in $scope.cameras){
            $scope.cameras[site].forEach(function(cam){
                live.getLiveImage(cam.serverId, cam.camid, function(image){
                    cam.image = image;
                });
            });
        }
        console.log(cameras);
    });

    $scope.showLiveFeed = function(serverId, camId){
        if (liveInterval){
            clearInterval(liveInterval);
        }

        liveInterval = setInterval(function(){
            live.getLiveImage(serverId, camId, function(image){
                $scope.liveImage = image;
            });
        }, 40);
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