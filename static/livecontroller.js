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

    $scope.sendnotification("This is what notifications will look like sdlkhfgjk adshg gj kdshaksdjfhjdsk hfjkdshjkfh jskahfj hjsahdl fhasdjlh fksadh fjkhasdf hj sdahf jksadhf j klds ahfj ksdh", false, 200000);

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

app.directive('liveplayer', ["live", "$interval", "device", function(live, $interval, device){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/liveplayer',
        scope:{camera: "=", },
        link: function(scope, elem, attrs){
            scope.playing = undefined;
            scope.fullscreen = false;

            scope.initialStyles = {
                width: elem.css('width'),
                height: elem.css('height'),
                lineHeight: elem.css('lineHeight'),
                marginLeft: elem.css('marginLeft')
            };

            if (device === 'desktop'){
                var containerHeight = elem.closest('.main-element').css('height');
                scope.fullscreenStyles = {
                    width: '70%',
                    height: containerHeight,
                    lineHeight: containerHeight,
                    marginLeft: '15%'
                };
            } else {
                scope.fullscreenStyles = {
                    width: '98%',
                    height: '90vw',
                    lineHeight: '90vw',
                    marginLeft: scope.initialStyles.marginLeft
                };
            }

            scope.togglelivefeed = function(){
                elem.find('.big-playing-indicator').show().fadeOut(500);

                if (!scope.playing){
                    scope.playing = $interval(function(){
                        live.getLiveImage(scope.camera.serverId, scope.camera.id, function(image){
                            scope.camera.image = image;
                        });
                    }, 200);
                } else {
                    $interval.cancel(scope.playing);
                    scope.playing = undefined;
                }
            };

            scope.togglefullscreen = function(){
                if (!scope.fullscreen){
                    scope.fullscreen = true;

                    // Reset elements
                    $.each(elem.parent().find('.liveplayer'), function(index, element){ 
                        animateToInitial($(this));
                    });

                    elem.css({'display': 'block'}).animate(scope.fullscreenStyles, 500, function(){
                        setTimeout(function(){
                           elem.offsetParent().animate({
                                scrollTop: elem.position().top
                            }, 500);
                        }, 0);
                    });

                } else {
                    scope.fullscreen = false;
                    animateToInitial(elem);
                }
            };

            var animateToInitial = function(element){
                element.animate(scope.initialStyles, 500, function(){
                    element.css({'display': 'inline-block'});
                });
            };

        }
    };
}]);