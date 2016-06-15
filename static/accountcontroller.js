app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', function($scope, $rootScope, $window, device) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.fieldsModified = false;

}]);