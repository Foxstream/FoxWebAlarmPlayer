var app = angular.module('alarmviewer', ['ngTouch', 'ngAnimate']);

// Notification system
app.run(function($rootScope){
    $rootScope.notification = "";
    $rootScope.shownotification = false;
    $rootScope.sendnotification = function(message, autoHide){
        $rootScope.notification = message;
        $rootScope.shownotification = true;
        if (autoHide){
            setTimeout(function(){
                $rootScope.shownotification = false;
            }, 3000);
        }
    };
});

app.animation('.notif-animation', function () {
    return {
        addClass: function (element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide') {
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