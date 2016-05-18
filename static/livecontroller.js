app.factory('live', ['$http','$rootScope',
    function($http, $rootScope){    
   
        var obj = {};

        obj.getCameras = function(callback){
            $http.get('/controller/live/cameras')
                .success(callback)
                .error(function(){ callback(null); });
        };

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", function($scope, $rootScope, $window, live) {
    $scope.cameras = 'test';
    live.getCameras(function(cameras){
        $scope.cameras = cameras;
    });
}]);