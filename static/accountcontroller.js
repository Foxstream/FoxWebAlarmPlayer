app.factory('user', ['$http', '$rootScope', function($http, $rootScope){
    
    var obj = {};

    obj.getCurrentUser = function(callback){
        $http.get('/controller/user/me')
            .success(callback)
            .error(function(){callback(null);});
    }

    return obj;

}]);

app.controller('accountController', ["$scope", '$rootScope', '$window', 'device', 'user', function($scope, $rootScope, $window, device, user) {
    
    $scope.device = device;
    $scope.showMenu = true;
    $scope.user = {};
    $scope.tab = 'loginForm';

    user.getCurrentUser(function(user){
        $scope.user = user;
    });

}]);