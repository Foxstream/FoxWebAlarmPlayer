app.controller('usercontroller', ["$scope",  "$window", "$location", "userdb", "$translate", function ($scope, $window, $location, userdb, $translate) {
        
        $scope.newuser = undefined;
        $scope.currentuser = undefined;
        $scope.users = [];
        $scope.device = device;

        $scope.back = function(){
            $window.location.href = '/accountsettings';
        };
   
        userdb.getUsers(function success(response){ 
            $scope.users = response.data;
        }, function error(response){
            $scope.logHttpError(response);
            $scope.sendnotification("NOTIF_ERROR_GETTING_USER_LIST", 
                    false, 
                    1);
        });

        userdb.getCurrentUser(function success(response){
            $scope.user = response.data;
        }, function error(response){
            $scope.logHttpError(response);
        });

        $scope.initemptyuser = function(){
            $scope.resetuser();
            $scope.newuser = {
                login: "",
                displayname: "",
                type: 0
            };
        };

        $scope.edituser = function(userId){
            $scope.newuser = undefined;
            // Calling this function if a user is already being edited would reset the fields
            if (!$scope.currentuser || $scope.currentuser.id !== userId){
                var pos = $scope.users.map(function (e) { return e.id; }).indexOf(userId);
                $scope.currentuser = angular.copy($scope.users[pos]);
            }
        };

        $scope.resetcurrentuser = function(){
            var pos = $scope.users.map(function (e) { return e.id; }).indexOf($scope.currentuser.id);
            $scope.currentuser = angular.copy($scope.users[pos]);
        }

        $scope.resetuser = function(){
            $scope.currentuser = undefined;
        };

        $scope.deleteuser = function (userId) {
            var pos = $scope.users.map(function (e) { return e.id; }).indexOf(userId);
            if (pos === -1 || !$window.confirm($translate.instant("CONFIRM_DELETE_USER", {username: $scope.users[pos].login}))){
                return;
            }
            userdb.deleteUser(userId, function success(response){
                $scope.users.splice(pos, 1);
                $scope.sendnotification("NOTIF_USER_DELETED", true, 1);
            }, function error(response){
                $scope.sendnotification("NOTIF_ERROR_DELETING_USER", false, 1);
                $scope.logHttpError(response);
            });
        };
        

        $scope.resetpassword = function (userId) { 
            var pos = $scope.users.map(function (e){ return e.id; }).indexOf(userId);
            if (pos === -1 || !$window.confirm($translate.instant("CONFIRM_RESET_PASSWORD", { username: $scope.users[pos].login}))){
                return;
            }
            userdb.requestPasswordReset(userId, function success(response){
                $scope.users[pos].shouldChangePassword = 1;
                $scope.sendnotification("NOTIF_PASSWORD_RESET", true, 1);
            }, function error(response){
                $scope.sendnotification("NOTIF_ERROR_RESETING_PASSWORD", false, 1);
                $scope.logHttpError(response);
            });
        };
        
        

        $scope.commitcurrentuser = function(){
            userdb.updateUser($scope.currentuser, function success(response){
                var pos = $scope.users.map(function (e) { return e.id; }).indexOf($scope.currentuser.id);
                $scope.users[pos] = $scope.currentuser;
                $scope.resetuser();
                $scope.sendnotification("NOTIF_USER_UPDATED", true, 1);
            }, function error(response){
                $scope.sendnotification("NOTIF_ERROR_UPDATING_USER" , false, 1);
                $scope.logHttpError(response);
                $scope.resetuser();
            });
        };

        $scope.commitnewuser = function(){
            userdb.createUser($scope.newuser, function success(response){
                console.log(response.data)
                $scope.newuser = undefined;
                $scope.users.push(response.data);
                $scope.sendnotification("NOTIF_USER_ADDED", true, 1);
            }, function error(response){
                $scope.sendnotification("NOTIF_ERROR_ADDING_USER" , false, 1);
                $scope.logHttpError(response);
            });
        };

        // We need $index 
        $scope.getUsersExceptMe = function(me){
            if ($scope.users && me){
                return $scope.users.filter(function(u){
                    return u.id !== me.id;
                });
            }
        }


}]);





