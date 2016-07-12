app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', 'userdb', function($scope, $rootScope, $window, device, userdb) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.user = {};
    $scope.password = {
        old: '',
        new: '',
        confirm: ''
    };
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

    $scope.changepassword = function(){
        if ($scope.password.new === $scope.password.confirm){
            var data = {
                user: $scope.user,
                oldPassword: $scope.password.old,
                newPassword: $scope.password.new
            };
            userdb.changepassword(data, function(err){
                if (err){
                    $scope.sendnotification(err, true, 1);
                } else {
                    $scope.sendnotification("Votre mot de passe a été changé", true, 1);
                }
            });
        } else {
            $scope.sendnotification("Les champs ne correspondent pas", true, 1);
        }
    };

}]);












