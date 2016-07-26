app.factory('userdb', ['$http', '$rootScope', function($http, $rootScope){
    
    var obj = {};
        
    obj.getUsers = function (success, error) {
        $http.get('/users')
            .then(success, error);
    };

    obj.getCurrentUser = function(success, error){
        $http.get('/users/me')
            .then(success, error);
    };

    obj.updateUser = function(user, success, callback){
        $http.put('/users/' + user.id, user)
            .then(success, callback);
    };

    obj.updateDisplayName = function(newName, success, error){
        $http.put('/users/me/displayname', {displayname: newName})
            .then(success, error);
    };

    obj.changePassword = function(oldpasswd, newpasswd, success, error){
        $http.put('/users/me/password', {
            oldPassword: oldpasswd,
            newPassword: newpasswd
        }).then(success, error);
    };

    obj.createUser = function(user, success, error){
        $http.post('/users', user).then(success, error);
    };

    obj.requestPasswordReset = function(userId, success, callback){
        $http.post('/users/' + userId + '/resetPassword')
            .then(success, callback);
    };

    obj.deleteUser = function(userId, success, callback){
        $http.delete('/users/' + userId)
            .then(success, callback);
    };

    return obj;

}]);