app.factory('serverdb', ['$http', '$rootScope', 
  function ($http, $rootScope) {
        var obj = {};
        
        obj.getservers = function (callback) {
            $http.get("/controller/servers")
			.success(callback)
			.error(function () { callback(null); });
        };
                
        obj.deleteserver = function (id, callback) {
            $http.delete("/controller/server/" + id)
			.success(callback)
			.error(function () { callback("Unable to delete server."); });
        };
        
        obj.updateserver = function (server, callback) {
            $http.put("/controller/server", server)
			.success(callback.bind(null, null))
			.error(function () { callback("Unable to update the server."); });
        };
        
        obj.addserver = function (server, callback) {
            $http.post("/controller/server", server)
			.success(callback.bind(null, null))
			.error(function (err) { console.dir(err);callback("Unable to add the server."); });
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
        
        // TODO (callback)
        serverdb.getservers(function (data){
            $scope.servers = data;
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
            serverdb.deleteserver(serverId, function (err){
                if (!err){
                    $scope.sendnotification("NOTIF_SERVER_DELETED", true, 1);
                    $scope.servers.splice(pos, 1);
                }
            });
        };

        $scope.commitcurrentserver = function(){
            serverdb.updateserver($scope.currentserver, function(err, newserver){
                if (err){
                    $scope.sendnotification("NOTIF_ERROR_DURING_SERVER_UPDATE", true, 1);
                } else {
                    var pos = $scope.servers.map(function (e) { return e.id; }).indexOf($scope.currentserver.id);
                    $scope.servers[pos] = $scope.currentserver;
                    $scope.resetserver();
                }
            });
        };

        $scope.commitnewserver = function(){
            serverdb.addserver($scope.newserver, function (err, newserver) {
                    $scope.sendnotification("NOTIF_SERVER_ADDED", true, 1);
                    if (!err) {
                        $scope.newserver = undefined;
                        $scope.servers.push(newserver);
                    }
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