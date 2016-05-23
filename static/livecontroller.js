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

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", function($scope, $rootScope, $window, live) {
    live.getCameras(function(cameras){
        $scope.cameras = cameras;
        console.log(cameras)
    });
}]);