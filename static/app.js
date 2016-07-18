var app = angular.module('alarmviewer', ['ngTouch', 'ngAnimate', 'anguFixedHeaderTable']);

// Notification system
app.run(function($rootScope, $timeout){
    
    $rootScope.notification = {
        message: "",
        show: false,
        timeout: undefined,
        priority: 0
    };

    /**
     * Function called by any controller when it needs to display a notification
     * @param message The message to be displayed
     * @param autoHide if set to true, the notification is hidden after 5s
     * @param priority if a new notification is sent when one is already being displayed, the new one will be shown only if its priority is higher or equal
     */
    $rootScope.sendnotification = function(message, autoHide, priority){
        if ($rootScope.notification.show && $rootScope.notification.priority > priority){
                return;
        }
        if ($rootScope.notification.timeout){
            $timeout.cancel($rootScope.notification.timeout);
            $rootScope.notification.timeout = undefined;
        }
        $rootScope.notification.message = message;
        $rootScope.notification.priority = priority;
        $rootScope.notification.show = true;
        if (autoHide){
            $rootScope.notification.timeout = $timeout(function(){
                $rootScope.notification.show = false;
                $rootScope.notification.timeout = undefined;
            }, 5000);
        }
    };

    $rootScope.hidenotification = function(){
        $rootScope.notification.show = false;
        $timeout.cancel($rootScope.notification.timeout);
        $rootScope.notification.timeout = undefined;
    };
});


app.animation('.notif-animation', function (){
    return {
        addClass: function (element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide'){
                element.slideUp(done);
            }
            else {
                done();
            }
        },
        removeClass: function (element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide') {
                element.removeClass('ng-hide');
                element.slideDown(done);
            }
            else {
                done();
            }
        }
    };
});

var tabletBreakpoint = 992;
var mobileBreakpoint = 768;
var viewportWidth = document.documentElement.clientWidth;

var device;
if (viewportWidth < mobileBreakpoint){
    device = 'mobile';
} else if (viewportWidth < tabletBreakpoint){
    device = 'tablet';
} else {
    device = 'desktop';
}


app.value('device', device);


app.directive('imagewithosd', function(){
    return {
        restrict: 'E',
        scope:{image:"=", osd:"="},
        replace: true,
        template: '<canvas class="imagecanvas"/>',
        link: function(scope, elem, attrs){

            var canvas = elem[0];

            elem.height(0.75 * elem.width());

            function repaintImage(){

                if (scope.image.naturalWidth > 0 && scope.image.naturalHeight > 0){

                    var ctx = canvas.getContext("2d");

                    var hRatio = ctx.width / scope.image.naturalWidth;
                    var vRatio = ctx.height / scope.image.naturalHeight;
                    var ratio = Math.min(hRatio, vRatio);
                    var shiftX = (ctx.width - scope.image.naturalWidth * ratio) / 2;
                    var shiftY = (ctx.height - scope.image.naturalHeight * ratio) / 2;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(scope.image, 0, 0, scope.image.naturalWidth, scope.image.naturalHeight,
                                                shiftX, shiftY, scope.image.naturalWidth * ratio, scope.image.naturalHeight * ratio);

                    if (scope.osd){
                        for (var i = 0; i < scope.osd.length; i++) {
                            var points = scope.osd[i];
                            
                            ctx.lineWidth = "2";
                            ctx.strokeStyle = "red";

                            ctx.beginPath();
                            ctx.moveTo(points[0].x * canvas.width / scope.image.width, points[0].y * canvas.height / scope.image.height);
                            for (var j = 0; j < points.length; j++)
                                ctx.lineTo(points[j].x * canvas.width / scope.image.width, points[j].y * canvas.height / scope.image.height);
                            ctx.closePath();
                            ctx.stroke();
                        }

                    }

                }

    		}
    		  
            scope.$watch('image', repaintImage);
            scope.$watch('osd', repaintImage);
            repaintImage();

        }

    };
});


app.directive('spinner', function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="spinner">',
        link: function(scope, elem, attrs){
            var options = {
                lines: 12,
                length: 12,
                corners: 1,
                radius: 12,
                rotate: 0,
                direction: 1,
                speed: 1,
                trail: 50,
                color: 'red',
                opacity: 0.25,
                direction: 1,
                speed: 1
            };
            var target = elem[0];
            var wheel = new Spinner(options).spin(target);
        }
    }
});