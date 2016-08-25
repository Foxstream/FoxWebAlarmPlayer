app.factory('live', ['$http','$rootScope',
    function($http, $rootScope){    
   
        var obj = {};

        obj.getCameras = function(success, error){
            $http.get('/cameras')
                .then(success, error);
        };

        obj.getLiveImage = function(serverId, camId, success, error){
            console.log('fetching live image')
            $http.get('/cameras/' + serverId + '/' + camId + '/live')
                .then(success, error);
        };

        return obj;
}]);

app.controller('livecontroller', ["$scope", '$rootScope', '$window', "live", "device", "$interval", "$translate", function($scope, $rootScope, $window, live, device, $interval, $translate) {
    
    $scope.selectedcamera = undefined;

    $scope.device = device;

    $scope.selectedcamera = undefined;

    live.getCameras(function success(response){
        console.log(response);
        if (response.status === 204){ // empty result, no cameras
            $scope.cameras = undefined;
        } else {
            $scope.cameras = response.data;
        }
        for (var site in $scope.cameras){
            $scope.cameras[site].forEach(function(cam){
                live.getLiveImage(cam.serverId, cam.id, function success(response){
                    cam.image = 'data:image/jpeg;base64,' + response.data;
                }, function error(response){
                    cam.image = '/img/no_video.png';
                    $scope.logHttpError(response);
                });
            });
        }
    }, function error(response){
        $scope.logHttpError(response);
        $scope.sendnotification("NOTIF_ERROR_GETTING_CAMERAS", 
            false, 
            1);
    });


    $scope.playfullscreen = function(site, camera){
        if (site && camera){
            $scope.selectedcamera = {
                site: site,
                camera: camera
            };
        } else {
            $scope.selectedcamera = undefined;
        }
    };

    $scope.shownextcamera = function(){
        if ($scope.selectedcamera){
            var currentSite = $scope.selectedcamera.site;
            var index = $scope.cameras[currentSite].map(function(c){ return c.id }).indexOf($scope.selectedcamera.camera.id);
            index++;
            if (index >= $scope.cameras[currentSite].length){
                index = 0;
            }
            $scope.selectedcamera.camera = $scope.cameras[currentSite][index];
        }
    }

    $scope.showpreviouscamera = function(){
        if ($scope.selectedcamera){
            var currentSite = $scope.selectedcamera.site;
            var index = $scope.cameras[currentSite].map(function(c){ return c.id }).indexOf($scope.selectedcamera.camera.id);
            index--;
            if (index < 0){
                index = $scope.cameras[currentSite].length - 1;
            }
            $scope.selectedcamera.camera = $scope.cameras[currentSite][index];
        }
    }

}]);

app.directive('liveplayer', ["live", "$interval", "device", function(live, $interval, device){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/liveplayer',
        // "pause" is set to true when a camera is selected for fullscreen : we don't want 
        // to stop playing completely, so that when fullscreen is closed, playing resumes
        scope: {site: "=", camera: "=", pause: "=", playfullscreen: '&', fullscreen: '=', help: '='},
        link: function(scope, elem, attrs){
            scope.showcontrols = true;
            scope.playing = undefined;
            scope.togglelivefeed = function(){
                elem.find('.big-playing-indicator').show().fadeOut(500);

                if (!scope.playing){
                    scope.playing = $interval(function(){
                        if (!scope.pause){
                            live.getLiveImage(scope.camera.serverId, scope.camera.id, function success(response){
                                scope.camera.image = 'data:image/jpeg;base64,' + response.data;
                            }, function error(response){
                                scope.logHttpError(response);
                                scope.camera.image = '/img/no_video.png';
                            });
                        }
                    }, 200);
                } else {
                    $interval.cancel(scope.playing);
                    scope.playing = undefined;
                }
            };

            scope.$watch('camera', function(newVal, oldVal){
                if (newVal === oldVal) return;
                if (newVal){
                    if(!scope.playing){
                        scope.togglelivefeed();
                    }
                } else if (scope.playing){
                    scope.togglelivefeed();
                }
            });

        }
    };
}]);

app.directive('liveimage', function(){
    return {
        restrict: 'E',
        scope:{image:"="},
        replace: true,
        template: '<canvas class="imagecanvas"/>',
        link: function(scope, elem, attrs){

            var canvas = elem[0];
            canvas.setAttribute('width', 800);
            canvas.setAttribute('height', 600);

            function repaintImage(){
                var image = new Image();
                image.src = scope.image;

                image.onload = function(){

                    if (image 
                        && image.naturalWidth 
                        && image.naturalWidth > 0 
                        && image.naturalHeight > 0){

                        var ctx = canvas.getContext("2d");
                        ctx.width = 800;
                        ctx.height = 600;

                        var hRatio = ctx.width / image.naturalWidth;
                        var vRatio = ctx.height / image.naturalHeight;
                        var ratio = Math.min(hRatio, vRatio);
                        var shiftX = (ctx.width - image.naturalWidth * ratio) / 2;
                        var shiftY = (ctx.height - image.naturalHeight * ratio) / 2;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight,
                                                    shiftX, shiftY, image.naturalWidth * ratio, image.naturalHeight * ratio);

                    }

                }

            }
              
            scope.$watch('image', function(newVal, oldVal){
                repaintImage();
            });

        }

    };
});

app.animation('.fullscreen-animation', function (){
    return {
        enter: function (element, done) {
            element.hide();
            element.fadeIn(done);
        },

        leave: function (element, done) {
            element.fadeOut(done);
        },
    };
});