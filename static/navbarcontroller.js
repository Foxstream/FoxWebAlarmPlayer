app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', 'stateManager', function($scope, $rootScope, $location, stateManager) {

    // Application state: number of new alarms, potential connection errors
    $scope.state = stateManager.getState();

    $scope.currentpage = $location.absUrl();
    console.debug($scope.currentpage)
    $scope.isActive = function(href){
        return $scope.currentpage.indexOf(href) > -1;
    };

    // $scope.notifyAlarm = function(event, data){
    //     if ($scope.currentpage.indexOf('alarmview') < 0){
    //         $scope.newalarmscounter++;
    //     }
    // }

    // var unbind = $rootScope.$on("alarm_create", $scope.notifyAlarm);
    // $scope.$on('$destroy', function () { unbind(); });

}]);