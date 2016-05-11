
app.factory('userdb', ['$http',
  function ($http) {
        var obj = {}
        
        obj.getusers = function (callback) {
            $http.get("/controller/users")
			.success(callback)
			.error(function () { callback(null); });
        };
        
        obj.resetpassword = function (id, callback){
            $http.post("/controller/user/"+id+"/resetpassword")
			.success(callback)
			.error(function () { callback("Unable to reset password."); });
        }
        
        obj.deleteuser = function (id, callback) {
            $http.delete("/controller/user/" + id)
			.success(callback)
			.error(function () { callback("Unable to delete user."); });
        }
        
        obj.adduser = function (username, callback){
            $http.post("/controller/user/new", {login: username})
			.success(callback.bind(null, null))
			.error(function () { callback("Unable to add the user."); });
        }
                
        return obj;
    }]);


app.controller('usercontroller', ["$scope",  "$window", "userdb", function ($scope, $window, userdb) {
        
        $scope.currentUser = undefined;
        $scope.userMsg = undefined;
        $scope.users = [];
                
        userdb.getusers(function (data) { $scope.users = data; });
        
        var updateMessage =function(err)
        {            
            $scope.userMsg  = err ? ("An error occured : " + err) : this+"";
        }

        $scope.resetPassword = function (id) { 
            var pos = $scope.users.map(function (e) { return e.id; }).indexOf(id);
            if (pos==-1 || !$window.confirm("Are you sure you want to reset the password for user " + $scope.users[pos].login))
                return;
            
            $scope.users[pos].shouldChangePassword = 1;
            $scope.userMsg  = "Resetting password...";
            userdb.resetpassword(id, updateMessage.bind("Password reset"));
        };
        
        $scope.deleteUser = function (id) {
            var pos = $scope.users.map(function (e) { return e.id; }).indexOf(id);
            if (pos == -1 || !$window.confirm("Are you sure you want to delete the user " + $scope.users[pos].login))
                return;
                        
            $scope.userMsg  = "Deleting user...";
            userdb.deleteuser(id, function (err) {
                updateMessage.call("User deleted", err);
                if (!err)
                    $scope.users.splice(pos, 1);
            });

        };

        $scope.addCurrentUser = function () {
            $scope.userMsg = "Adding user...";
            userdb.adduser($scope.currentUser, function (err, newuser) {
                updateMessage.call("User added", err);
                if (!err) {
                    $scope.currentUser = undefined;
                    $scope.users.push(newuser);
                }
            })
        };

    }]);