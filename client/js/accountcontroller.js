app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', 'userdb', '$translate', '$timeout', function($scope, $rootScope, $window, device, userdb, $translate, $timeout) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.user = {};
    $scope.password = {
        old: '',
        new: '',
        confirm: ''
    };
    $scope.tab = 'loginForm';

    $scope.currentLanguage = $scope.getCurrentLanguage();

    $scope.onLanguageChange = function(){
        $scope.changeLanguage($scope.currentLanguage);
    };

    userdb.getCurrentUser(function success(response){
            $scope.user = response.data;
        }, function error(response){
            $scope.logHttpError(response);
            $scope.sendnotification("NOTIF_ERROR_GETTING_ACCOUNT_INFO", 
                    false,
                    1);
    });

    $scope.commituser = function(){
        userdb.updateDisplayName($scope.user.displayname, function success(resopnse){
            $scope.sendnotification("NOTIF_NAME_CHANGED", true, 1);
        }, function error(response){
            $scope.sendnotification("NOTIF_ERROR_UPDATING_USER_INFO", 
                false, 1);
            $scope.logHttpError(response);
        });
    };


    $scope.changepassword = function(){
        if ($scope.password.new === $scope.password.confirm){
            userdb.changePassword($scope.password.old, $scope.password.new, function success(response){
                $scope.sendnotification("NOTIF_PASSWORD_CHANGED", true, 1);
                $timeout(function(){
                    $window.location.href = '/';
                },3000);
            }, function error(response){
                if (response.status === 401){
                    $scope.sendnotification("NOTIF_INCORRECT_PASSWORD", false, 1);
                } else {
                    $scope.sendnotification("NOTIF_ERROR_UPDATING_PASSWORD", false, 1);
                }
                $scope.logHttpError(response);
            });
        } else {
            $scope.sendnotification("NOTIF_ERROR_PASSWORD_FIELDS_DONT_MATCH", false, 1);
        }
    };

}]);












