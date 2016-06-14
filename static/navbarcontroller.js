app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', function($scope, $rootScope, $location) {

    $scope.isActive = function(href){
        var url = $location.absUrl();
        return url.indexOf(href) > -1;
    }

}]);