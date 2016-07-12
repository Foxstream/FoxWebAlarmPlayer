app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', 'alarmevents', function($scope, $rootScope, $location, alarmevents) {

    $scope.currentpage = $location.absUrl();

    $scope.isActive = function(href){
        return $scope.currentpage.indexOf(href) > -1;
    };

}]);