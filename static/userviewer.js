﻿app.factory('userdb', ['$http',
  function ($http) {
        var obj = {};
        
        obj.getusers = function (callback) {
            $http.get("/controller/users")
			.success(callback)
			.error(function () { callback(null); });
        };
        
        obj.resetpassword = function (id, callback){
            $http.post("/controller/user/"+id+"/resetpassword")
			.success(callback)
			.error(function () { callback("Unable to reset password."); });
        };
        
        obj.deleteuser = function (id, callback) {
            $http.delete("/controller/user/" + id)
			.success(callback)
			.error(function () { callback("Unable to delete user."); });
        };

        obj.updateuser = function(user, callback){
            $http.put("/controller/user", user)
            .success(callback.bind(null, null))
            .error(function () { callback("Impossible de mettre à jour l'utilisateur"); });
        };
        
        obj.adduser = function (user, callback){
            $http.post("/controller/user/new", user)
			.success(callback.bind(null, null))
			.error(function () { callback("Unable to add the user."); });
        };
                
        return obj;
    }]);


app.controller('usercontroller', ["$scope",  "$window", "$location", "userdb", "user", function ($scope, $window, $location, userdb, user) {
        
        $scope.newuser = undefined;
        $scope.currentuser = undefined;
        $scope.users = [];
        $scope.device = device;

        $scope.back = function(){
            $window.location.href = '/accountsettings';
        };
   
        userdb.getusers(function (data){ 
            $scope.users = data; 
            console.debug($scope.users)
        });

        user.getCurrentUser(function(user){
            $scope.user = user;
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
            // Calling this function if a user is already being edited would reset the fields
            if (!$scope.currentuser || $scope.currentuser.id !== userId){
                var pos = $scope.users.map(function (e) { return e.id; }).indexOf(userId);
                $scope.currentuser = angular.copy($scope.users[pos]);
            }
        };

        $scope.resetuser = function(){
            $scope.currentuser = undefined;
        };

        $scope.deleteuser = function (userId) {
            var pos = $scope.users.map(function (e) { return e.id; }).indexOf(userId);
            if (pos === -1 || !$window.confirm("Voulez-vous vraiment supprimer cet utilisateur ? " + $scope.users[pos].description + " ?")){
                return;
            }
            userdb.deleteuser(userId, function (err){
                if (!err){
                    $scope.sendnotification("L'utilisateur a été supprimé.", true, 1);
                    $scope.users.splice(pos, 1);
                }
            });
        };
        

        $scope.resetpassword = function (userId) { 
            var pos = $scope.users.map(function (e){ return e.id; }).indexOf(userId);
            if (pos === -1 || !$window.confirm("Voulez-vous vraiment remettre à zéro le mot de passe ?" + $scope.users[pos].login)){
                return;
            }
            
            $scope.users[pos].shouldChangePassword = 1;
            userdb.resetpassword(userId, function(){
                $scope.sendnotification("Le mot de passe à été remis à zéro", true, 1);
            });
        };
        
        $scope.commitcurrentuser = function(){
            userdb.updateuser($scope.currentuser, function(err, newuser){
                if (err){
                    $scope.sendnotification("Une erreur s'est produite.", true, 1);
                } else {
                    var pos = $scope.users.map(function (e) { return e.id; }).indexOf($scope.currentuser.id);
                    $scope.users[pos] = $scope.currentuser;
                    $scope.resetuser();
                }
            });
        };

        $scope.commitnewuser = function(){
            userdb.adduser($scope.newuser, function (err, newuser) {
                    $scope.sendnotification("L'utilisateur a été ajouté.", true, 1);
                    if (!err) {
                        $scope.newuser = undefined;
                        $scope.users.push(newuser);
                    }
                });
        };

}]);





