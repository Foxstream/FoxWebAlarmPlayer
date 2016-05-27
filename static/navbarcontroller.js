app.controller('navbarcontroller', ["$scope", '$rootScope', '$location', function($scope, $rootScope, $location) {

    $scope.isActive = function(href){
        var url = $location.absUrl().split('/').slice(-1)[0];
        return href === url;
    }

}]);