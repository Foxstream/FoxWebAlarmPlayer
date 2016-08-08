app.factory('serverdb', ['$http', '$rootScope', function ($http, $rootScope) {

        var obj = {};
        
        obj.getservers = function (success, error) {
            $http.get("/servers")
                .then(success, error);
        };

        obj.updateserver = function (server, success, error) {
            $http.put("/servers/" + server.id, server)
                .then(success, error);
        };

        obj.addserver = function (server, success, error) {
            $http.post("/servers", server)
                .then(success, error);
        };
                
        obj.deleteserver = function (serverid, success, error) {
            $http.delete("/servers/" + serverid)
                .then(success, error);
        };
        
        return obj;

    }]);




app.controller('servercontroller', ["$rootScope", "$scope", "$window", "serverdb", 'alarmevents', 'device', '$translate', function ($rootScope, $scope, $window, serverdb, alarmevents, device, $translate) {
        
        $scope.newserver = undefined;
        $scope.currentserver = undefined;
        $scope.servers = [];
        $scope.device = device;
        $scope.selected = undefined;

        $scope.back = function(){
            $window.location.href = '/accountsettings';
        };
        
        serverdb.getservers(function success(response){
            $scope.servers = response.data;
        }, function error(response){
            $scope.logHttpError(response);
            $scope.sendnotification("NOTIF_ERROR_GETTING_SERVER_LIST", 
                    false, 
                    1);        
        });
        
        $scope.initemptyserver = function () {
            $scope.resetserver();
            $scope.newserver = {
                address: "192.168.",
                port: 4000,
                username: "admin",
                password: "",
                description: ""
            };
        };

        $scope.editserver = function(serverId){
            $scope.newserver = undefined;
            // Calling this function if a server is already being edited would reset the fields
            if (!$scope.currentserver || $scope.currentserver.id !== serverId){
                var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(serverId);
                $scope.currentserver = angular.copy($scope.servers[pos]);
            }
        };

        $scope.resetserver = function(){
            $scope.currentserver = undefined;
        };

        $scope.deleteserver = function (serverId) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(serverId);
            if (pos === -1 || !$window.confirm($translate.instant("CONRIM_DELETE_SERVER"))){
                return;
            }
            serverdb.deleteserver(serverId, function success(response){
                $scope.servers.splice(pos, 1);
                $scope.sendnotification("NOTIF_SERVER_DELETED", true, 1);
            }, function error(response){
                $scope.logHttpError(response);
                $scope.sendnotification("NOTIF_ERROR_DELETING_SERVER", 
                        false, 
                        1); 
            });
        };

        $scope.commitcurrentserver = function(){
            serverdb.updateserver($scope.currentserver, function success(response){
                var pos = $scope.servers.map(function (e) { return e.id; }).indexOf($scope.currentserver.id);
                $scope.servers[pos] = $scope.currentserver;
                $scope.resetserver();
                $scope.sendnotification("NOTIF_SERVER_UPDATED", true, 1);
            }, function error(response){
                $scope.resetserver();
                $scope.logHttpError(response);
                $scope.sendnotification("NOTIF_ERROR_UPDATING_SERVER", 
                        false, 
                        1);
            });
        };

        $scope.commitnewserver = function(){
            serverdb.addserver($scope.newserver, function success(response){
                $scope.newserver = undefined;
                $scope.servers.push(response.data);
                $scope.sendnotification("NOTIF_SERVER_ADDED", true, 1);
            }, function error(response){
                $scope.sendnotification("NOTIF_ERROR_ADDING_SERVER" , false, 1);
                $scope.logHttpError(response);               
            });
        };


        $scope.getDisconnectedServers = function(){
            if ($scope.servers){
                return $scope.servers.filter(function(s){
                    return !s.connected;
                });
            } else return {};
        };


        var statusUpdate = function (event, server) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(server.id);
            if (pos >= 0){
                $scope.servers[pos] = angular.copy(server);
                if (!server.connected){

                    var disconnectedServers = $scope.servers.filter(function(s){ return !s.connected; });

                    var serverList = '';
                    disconnectedServers.forEach(function(s, index){
                        serverList += '"' + s.description + '" (' + s.address + ')';
                        if (index !== disconnectedServers.length - 1){
                            serverList += ", ";
                        }
                    });
                    var params = {serverlist: serverList };
                    $scope.sendnotification("NOTIF_CONNECTION_LOST", false, 1000, params);

                } else {
                    var server = '"' + $scope.servers[pos].description + '" (' + $scope.servers[pos].address + ')';
                    $scope.sendnotification("NOTIF_CONNECTION_ESTABLISHED", true, 1000, { server: server });

                }
            }
        };
        
        var unbind = $rootScope.$on("connection", statusUpdate);
        $scope.$on('$destroy', unbind);

    }]);