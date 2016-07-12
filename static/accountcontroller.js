app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', 'userdb', function($scope, $rootScope, $window, device, userdb) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.user = {};
    $scope.tab = 'loginForm';

    userdb.getcurrentuser(function(user){
        $scope.user = user;
    });

    $scope.commituser = function(){
        userdb.updatecurrentuser($scope.user, function(err){
            if (err){
                $scope.sendnotification(err, true, 1);
            } else {
                $scope.sendnotification("Vos modifications ont été enregistrées", true, 1);
            }
        });
    };

}]);