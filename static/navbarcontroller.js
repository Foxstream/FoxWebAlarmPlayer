app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', function($scope, $rootScope, $location) {

    $scope.currentpage = $location.absUrl();
    console.debug($scope.currentpage)
    $scope.isActive = function(href){
        return $scope.currentpage.indexOf(href) > -1;
    };

    $scope.newalarmscounter = 0;

    $scope.notifyAlarm = function(event, data){
        if ($scope.currentpage.indexOf('alarmview') < 0){
            $scope.newalarmscounter++;
        }
    }

    var unbind = $rootScope.$on("alarm_create", $scope.notifyAlarm);
    $scope.$on('$destroy', function () { unbind(); });

}]);