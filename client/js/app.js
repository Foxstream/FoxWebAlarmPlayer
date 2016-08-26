var app = angular.module('alarmviewer', ['ngTouch', 'ngAnimate', 'pascalprecht.translate']);

app.config(function($translateProvider){
    $translateProvider.useStaticFilesLoader({
        prefix: '/locale/locale-',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('fr');
});

// Notification system
app.run(function($rootScope, $timeout, $translate){

    /* For now, there is no way of asking angular-translate-loader what 
    languages are available */
    $rootScope.languages = ['fr', 'en'];

    var language = localStorage.getItem('language');
    if (language){
        $translate.use(language);
    } else {
        language = navigator.language || navigator.userLanguage;
        if (language.substr(0, 2) == "fr"){
            $translate.use("fr");
        } else {
            $translate.use("en");
        }
    }

    $rootScope.changeLanguage = function(langKey){
        $translate.use(langKey);
        localStorage.setItem('language', langKey);
    };

    $rootScope.getCurrentLanguage = function(){
        return $translate.use();
    }

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
     * @param params Used for dynamic translations
     */
    $rootScope.sendnotification = function(message, autoHide, priority, params){
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
        $rootScope.notification.params = params;
        
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

    /**
      * Helper function to log http error messages
    **/
    $rootScope.logHttpError = function(httpResponse){
        var errorMsg = "Error : " + 
            httpResponse.config.method + " " + httpResponse.config.url
        + "\nCode " + httpResponse.status 
        + " - " + httpResponse.statusText
        + " : " 
        + httpResponse.data;
        console.error(errorMsg);
    }

    $rootScope.help = false;
    $rootScope.$watch('help', function(newVal, oldVal){
        console.log(newVal)
    })

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


function getClientDevice(){

    var tabletBreakpoint = 992;
    var mobileBreakpoint = 768;
    var viewportWidth = document.documentElement.clientWidth;

    if (viewportWidth < mobileBreakpoint){
        return 'mobile';
    } else if (viewportWidth < tabletBreakpoint){
        return 'tablet';
    } else {
        return 'desktop';
    }

}

// This whole system is not clean and could be replaced by css classes (hidden-*), but it has the advantage
// of allowing us to use angular's ng-if to show/hide some elements (much more efficient for big HTML pages)
var device = getClientDevice();
app.value('device', device);
angular.element(window).bind("resize", function(){
    var deviceUpdated = getClientDevice();
    if (deviceUpdated !== device){
        location.reload();
    }
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