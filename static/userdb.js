app.factory('userdb', ['$http', '$rootScope', function($http, $rootScope){
    
    var obj = {};
        
    obj.getusers = function (success, error) {
        $http.get('/users')
            .then(success, error);
    };

    obj.resetpassword = function (id, callback){
        $http.post("/controller/users/"+id+"/resetpassword")
        .success(callback)
        .error(function () { callback("Unable to reset password."); });
    };

    obj.deleteuser = function (id, callback) {
        $http.delete("/controller/users/" + id)
        .success(callback)
        .error(function () { callback("Unable to delete user."); });
    };

    obj.updateuser = function(user, callback){
        $http.put("/controller/users", user)
        .success(callback.bind(null, null))
        .error(function () { callback("Impossible de mettre à jour l'utilisateur"); });
    };

    obj.updatecurrentuser = function(user, callback){
        $http.put("/controller/users/me", user)
        .success(callback.bind(null, null))
        .error(function () { callback("Impossible de mettre à jour l'utilisateur"); });
    };

    obj.adduser = function (user, callback){
        $http.post("/controller/users/new", user)
        .success(callback.bind(null, null))
        .error(function () { callback("Unable to add the user."); });
    };

    obj.getcurrentuser = function(callback){
        $http.get('/controller/users/me')
            .success(callback)
            .error(function(){callback(null);});
    };

    obj.changepassword = function(data, callback){
        $http.post('/controller/users/me/password', data)
            .success(callback)
            .error(function(){callback(null);});
    };

    obj.changeemptypassword = function(data, callback){
        $http.post('/controller/users/me/changeemptypassword', data)
            .success(callback)
            .error(function(){callback(null);});
    };

    return obj;

}]);