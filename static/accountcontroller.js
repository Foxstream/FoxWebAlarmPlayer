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
                $scope.sendnotification("Vos nom a été changé.", true, 1);
                $scope.showMenu = true;
            }
        });
    };

    // Called if shouldChangePassword == 1, i.e. user doesn't specify his old password
    $scope.changeemptypassword = function(){
        if ($scope.password.new === $scope.password.confirm){
            var data = {
                user: $scope.user,
                newPassword: $scope.password.new
            };
            userdb.changeemptypassword(data, function(err){
                if (err){
                    console.debug(err);
                    $scope.sendnotification(err, true, 1);
                } else {
                    $scope.sendnotification("Votre mot de passe a été changé", true, 1);
                    $scope.showMenu = true;
                }
            });
        } else {
            $scope.sendnotification("Les champs ne correspondent pas", true, 1);
        }      
    };


    // Called if user decides to change his passwords, i.e. old password needs to be specified
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
                    $scope.showMenu = true;
                }
            });
        } else {
            $scope.sendnotification("Les champs ne correspondent pas", true, 1);
        }
    };

}]);












