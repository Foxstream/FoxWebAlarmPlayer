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
                callback('/static/img/no_video.png');
            });
        };

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", "device", "$interval", function($scope, $rootScope, $window, live, device, $interval) {
    
    $scope.selectedcamera = undefined;

    $scope.device = device;

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


    $scope.playfullscreen = function(site, serverId, camId, fps, event){
        var liveplayer = $(event.target.parentElement.parentElement);
    };


    $scope.shownextcamera = function(){
        var nextCamera = $scope.getNextCamera();
        if (nextCamera !== -1){
            var cam = $scope.cameras[$scope.currentsite][nextCamera];
            $scope.playlivefeed($scope.currentsite, cam.serverId, cam.id, 250);
        }
    };

    $scope.showpreviouscamera = function(){
        var previousCamera = $scope.getPreviousCamera();
        if (previousCamera !== -1){
            var cam = $scope.cameras[$scope.currentsite][previousCamera];
            $scope.playlivefeed($scope.currentsite, cam.serverId, cam.id, 250);
        }
    };

    $scope.getNextCamera = function(){
        var displayedCameras = $scope.cameras[$scope.currentsite];
        if (displayedCameras.length < 2){
            return -1;
        } else {
            var position = displayedCameras.map(function(c){ return c.id; }).indexOf($scope.selectedcamera.id);
            if (position === displayedCameras.length - 1){
                return 0;
            } else {
                return position + 1;
            }
        }
    };

    $scope.getPreviousCamera = function(){
        var displayedCameras = $scope.cameras[$scope.currentsite];
        if (displayedCameras.length < 2){
            return -1;
        } else {
            var position = displayedCameras.map(function(c){ return c.id; }).indexOf($scope.selectedcamera.id);
            if (position === 0){
                return displayedCameras.length - 1;
            } else {
                return position - 1;
            }
        }
    };

}]);

app.directive('liveplayer', ["live", "$interval", function(live, $interval){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/liveplayer',
        scope:{camera: "=", },
        link: function(scope, elem, attrs){
            scope.playing = undefined;
            scope.fullscreen = false;
            scope.togglelivefeed = function(){
                if (!scope.playing){
                    scope.playing = $interval(function(){
                        live.getLiveImage(scope.camera.serverId, scope.camera.id, function(image){
                            scope.camera.image = image;
                        });
                    }, 500);
                } else {
                    $interval.cancel(scope.playing);
                    scope.playing = undefined;
                }
            };
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
                        return c.id;
                    }).indexOf(scope.selectedcamera.id);
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