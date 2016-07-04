var app = angular.module('alarmviewer', ['ngTouch', 'ngAnimate']);

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
     * @param priority if a new notification is sent when one is already being displayed, the new one will be shown only if its priority is higher
     */
    $rootScope.sendnotification = function(message, autoHide, priority){
        if ($rootScope.notification.show){
            if ($rootScope.notification.priority > priority){
                return;
            }
        }
        $rootScope.notification.message = message;
        $rootScope.notification.priority = priority;
        $rootScope.notification.show = true;
        if (autoHide){
            if (!$rootScope.notification.timeout){
                $rootScope.notification.timeout = $timeout(function(){
                    $rootScope.notification.show = false;
                    // Only way to really stop the timer
                    // Without this line, a new notification before the 5000 ms have passed would restart the original timer, hence a shorter notification (really weird though)
                    $rootScope.notification.timeout = undefined;
                }, 5000);
            }
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