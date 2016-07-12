app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', 'userdb', function($scope, $rootScope, $window, device, userdb) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.user = {};
    $scope.tab = 'loginForm';

    userdb.getcurrentuser(function(user){
        $scope.user = user;
    });

    $scope.changeDisplayName = function(){
        
    };

}]);