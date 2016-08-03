app.factory('logdb', ['$http', function($http){
    
    var obj = {};

    obj.getLog = function(success, error){
        $http.get('/log')
            .then(success, error);
    };

    obj.getOldLog = function(success, error){
        $http.get('/log/old')
            .then(success, error);
    };

    return obj;

}]);

app.controller('logcontroller', ['$scope', '$rootScope', 'logdb', '$translate', function($scope, $rootScope, logdb, $translate){

    $scope.log = '';
    $scope.oldlog = false;

    logdb.getLog(function success(response){
        $scope.log = response.data;
    }, function error(response){
        $scope.sendnotification("Impossible de récupérer les fichiers log.", false, 1);
        $scope.logHttpError(response);
    });

    logdb.getOldLog(function success(response){
        if (response.status === 200){
            $scope.oldlog = response.data;
        }
    }, function error(response){
        $scope.sendnotification("Impossible de récupérer les fichiers log.", false, 1);
        $scope.logHttpError(response);
    });

}]);

app.directive('logviewer', function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {log: '=', oldlog: '='},
        templateUrl: '/logviewer',
        link: function(scope, elem, attrs){
            scope.showOldLog = false;
            scope.$watch('log', function(){
                // This seems to be the right way to do it because... reasons
                elem.scrollTop(elem[0].scrollHeight);
            });
        }
    }
});






