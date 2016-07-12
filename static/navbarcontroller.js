app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', 'alarmevents', function($scope, $rootScope, $location, alarmevents) {

    $scope.currentpage = $location.absUrl();

    $scope.alarmcounter = localStorage.getItem('alarmcounter') || 0;

    if ($scope.currentpage.indexOf('alarmview') > 0){
        $scope.alarmcounter = 0;
        localStorage.setItem('alarmcounter', $scope.alarmcounter);
    }


    $scope.isActive = function(href){
        return $scope.currentpage.indexOf(href) > -1;
    };

    var unbind2 = $rootScope.$on("alarm_create", function(data){
        if ($scope.currentpage.indexOf('alarmview') === 0){
            $scope.alarmcounter = 0;
            localStorage.setItem('alarmcounter', $scope.alarmcounter);
        }
    });


    $scope.$on('$destroy', function () { unbind(); });

}]);