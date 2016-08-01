app.factory('logdb', ['$http', function($http){
    
    var obj = {};

    obj.getLog = function(success, error){
        $http.get('/log')
            .then(success, error);
    }

    return obj;

}]);

app.controller('logcontroller', ['$scope', '$rootScope', 'logdb', function($scope, $rootScope, logdb){

    $scope.log = '';

    logdb.getLog(function success(response){
        $scope.log = response.data;
    }, function error(response){
        $scope.sendnotification("Impossible de récupérer les fichiers log.", false, 1);
        $scope.logHttpError(response);
    });

}]);

app.directive('logviewer', function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {log: '='},
        template: '<div class="logviewer">{{ log }}</div>',
        link: function(scope, elem, attrs){
            console.log(elem.scrollTop());
            scope.$watch('log', function(){
                // This syntax works for some reason
                elem.scrollTop(elem[0].scrollHeight);
            });
        }
    }
});








