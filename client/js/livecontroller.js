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
        if (site){
            console.log('Playfullscreen')
            $scope.selectedcamera = {
                site: site,
                camera: camera
            };
            console.log($scope.selectedcamera);
        } else {
            $scope.selectedcamera = undefined;
            console.log($scope.selectedcamera)
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
            if (index <= 0){
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
        scope: {site: "=", camera: "=", pause: "=", playfullscreen: '&', fullscreen: '='},
        link: function(scope, elem, attrs){

            scope.showcontrols = true;
            scope.playing = undefined;
            scope.togglelivefeed = function(){
                elem.find('.big-playing-indicator').show().fadeOut(500);

                if (!scope.playing){
                    scope.playing = $interval(function(){
                        if (!scope.pause){
                            live.getLiveImage(scope.camera.serverId, scope.camera.id, function(image){
                                scope.camera.image = image;
                            });
                        }
                    }, 200);
                } else {
                    $interval.cancel(scope.playing);
                    scope.playing = undefined;
                }
            };

            if (scope.fullscreen && !scope.playing){
                scope.togglelivefeed();
            }

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