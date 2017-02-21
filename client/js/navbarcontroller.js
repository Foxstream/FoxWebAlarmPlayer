app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', 'alarmevents', 'appstate', '$translate', function($scope, $rootScope, $location, alarmevents, appstate, $translate) {

    $scope.showLanguagePicker = false;
    setTimeout(function(){
        $scope.currentLanguage = $scope.getCurrentLanguage();
    }, 0);

    $scope.currentpage = $location.absUrl();

    $scope.alarmcounter = appstate.getState('alarmcounter') || 0;

    if ($scope.currentpage.indexOf('alarmview') > -1){
        $scope.alarmcounter = 0;
        appstate.saveState('alarmcounter', 0);
    }

    $scope.isActive = function(href){
        return $scope.currentpage.indexOf(href) > -1;
    };

    var unbind2 = $rootScope.$on("alarm_create", function(data){
        if ($scope.currentpage.indexOf('alarmview') === -1){
            $scope.alarmcounter += 1;
            localStorage.setItem('alarmcounter', $scope.alarmcounter);
        }
    });


    $scope.$on('$destroy', function () { unbind(); });

}]);