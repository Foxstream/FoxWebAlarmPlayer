app.factory('user', ['$http', '$rootScope', function($http, $rootScope){
    
    var obj = {};

    obj.getCurrentUser = function(callback){
        $http.get('/controller/user/me')
            .success(callback)
            .error(function(){callback(null);});
    };

    return obj;

}]);