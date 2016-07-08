app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', 'user', function($scope, $rootScope, $window, device, user) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.user = {};
    $scope.tab = 'loginForm';

    user.getCurrentUser(function(user){
        $scope.user = user;
    });

}]);