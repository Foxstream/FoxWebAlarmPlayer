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

    userdb.getCurrentUser(function success(response){
            $scope.user = response.data;
        }, function error(response){
            $scope.logHttpError(response);
            $scope.sendnotification("Impossible d'obtenir vos informations.", 
                    false,
                    1);
    });

    $scope.commituser = function(){
        userdb.updateDisplayName($scope.user.displayname, function success(resopnse){
            $scope.sendnotification("Votre nom a été changé", true, 1);
        }, function error(response){
            $scope.sendnotification("Une erreur s'est produite lors de l'enregistrement de vos informations", 
                false, 1);
            $scope.logHttpError(response);
        });
    };


    $scope.changepassword = function(){
        if ($scope.password.new === $scope.password.confirm){
            userdb.changePassword($scope.password.old, $scope.password.new, function success(response){
                $scope.sendnotification("Votre mot de passe a été changé", true, 1);
            }, function error(response){
                if (response.status === 401){
                    $scope.sendnotification("Le mot de passe saisi est incorrect", false, 1);
                } else {
                    $scope.sendnotification("Une erreur s'est produite lors de l'enregistrement de votre nouveau mot de passe.",
                            false, 1);
                }
                $scope.logHttpError(response);
            });
        } else {
            $scope.sendnotification("Les champs nouveau mot de passe et confirmation doivent correspondre", false, 1);
        }
    };

}]);












