app.factory('live', ['$http','$rootScope',
    function($http, $rootScope){    
   
        var obj = {};

        // obj.getCameras = function(callback){
        //     $http.get('/controller/live/cameras')
        //         .success(function(cameras){
        //             cameras.forEach(function(c){
        //                 if (!c.image){
        //                     c.image = '/static/img/no_video.png';
        //                 } else {
        //                     c.image = 'data:image/jpeg;base64,' + c.image;
        //                 }
        //             })
        //             callback(cameras);
        //         })
        //         .error(function(){ callback(null); });
        // };
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
    live.getCameras(function(cameras){
        $scope.cameras = cameras;
        console.log(cameras)
    });

    setInterval(function(){
        if ($scope.cameras){
            for (var site in $scope.cameras){
                $scope.cameras[site].forEach(function(cam){
                    live.getLiveImage(cam.serverId, cam.camid, function(image){
                        cam.image = image;  
                    });
                });
            }
        }
    }, 200);

}]);