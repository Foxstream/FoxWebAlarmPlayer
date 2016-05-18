app.factory('live', ['$http','$rootScope',
    function($http, $rootScope){    
   
        var obj = {};

        obj.getCameras = function(callback){
            $http.get('/controller/live/cameras')
                .success(function(cameras){
                    cameras.sort(function(c1, c2){
                        return c1.camid < c2.camid;
                    });
                    callback(cameras);
                })
                .error(function(){ callback(null); });
        };

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", function($scope, $rootScope, $window, live) {
    $scope.cameras = 'test';
    live.getCameras(function(cameras){
        $scope.cameras = cameras;
        console.debug(cameras);
    });

}]);
