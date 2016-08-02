app.factory('live', ['$http','$rootScope',
    function($http, $rootScope){    
   
        var obj = {};

        obj.getCameras = function(callback){
            $http.get('/controller/live/cameras')
            .success(callback)
            .error(function(){ callback(null); });
        };

        obj.getLiveImage = function(serverId, camId, callback){
            $http.get('/controller/live/' + serverId + '/' + camId)
            .success(function(image){
                callback('data:image/jpeg;base64,' + image);
            })
            .error(function(err){ 
                callback('/img/no_video.png');
            });
        };

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", "device", "$interval", "$translate", function($scope, $rootScope, $window, live, device, $interval, $translate) {
    
    $scope.selectedcamera = undefined;

    $scope.device = device;

    $scope.selectedcamera = undefined;

    live.getCameras(function(cameras){
        $scope.cameras = cameras;
        for (var site in $scope.cameras){
            $scope.cameras[site].forEach(function(cam){
                live.getLiveImage(cam.serverId, cam.id, function(image){
                    cam.image = image;
                });
            });
        }
    });


    $scope.playfullscreen = function(site, camera){
        console.log('Playfullscreen')
        $scope.selectedcamera = {
            site: site,
            camera: camera
        };
        console.log($scope.selectedcamera);
    };


    // $scope.shownextcamera = function(){
    //     var nextCamera = $scope.getNextCamera();
    //     if (nextCamera !== -1){
    //         var cam = $scope.cameras[$scope.currentsite][nextCamera];
    //         $scope.playlivefeed($scope.currentsite, cam.serverId, cam.id, 250);
    //     }
    // };

    // $scope.showpreviouscamera = function(){
    //     var previousCamera = $scope.getPreviousCamera();
    //     if (previousCamera !== -1){
    //         var cam = $scope.cameras[$scope.currentsite][previousCamera];
    //         $scope.playlivefeed($scope.currentsite, cam.serverId, cam.id, 250);
    //     }
    // };

    // $scope.getNextCamera = function(){
    //     var displayedCameras = $scope.cameras[$scope.currentsite];
    //     if (displayedCameras.length < 2){
    //         return -1;
    //     } else {
    //         var position = displayedCameras.map(function(c){ return c.id; }).indexOf($scope.selectedcamera.id);
    //         if (position === displayedCameras.length - 1){
    //             return 0;
    //         } else {
    //             return position + 1;
    //         }
    //     }
    // };

    // $scope.getPreviousCamera = function(){
    //     var displayedCameras = $scope.cameras[$scope.currentsite];
    //     if (displayedCameras.length < 2){
    //         return -1;
    //     } else {
    //         var position = displayedCameras.map(function(c){ return c.id; }).indexOf($scope.selectedcamera.id);
    //         if (position === 0){
    //             return displayedCameras.length - 1;
    //         } else {
    //             return position - 1;
    //         }
    //     }
    // };

}]);

app.directive('liveplayer', ["live", "$interval", "device", function(live, $interval, device){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/liveplayer',
        // "pause" is set to true when a camera is selected for fullscreen : we don't want 
        // to stop playing completely, so that when fullscreen is closed, playing resumes
        scope: {site: "=", camera: "=", pause: "=", playfullscreen: '&'},
        link: function(scope, elem, attrs){
            scope.playing = undefined;
            scope.fullscreen = false;

                // scope.fullscreenStyles = {
                //     width: '70%',
                //     height: containerHeight,
                //     lineHeight: containerHeight,
                //     marginLeft: '15%'
                // };

        }
    };
}]);