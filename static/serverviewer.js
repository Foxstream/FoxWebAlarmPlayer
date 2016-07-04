
app.factory('serverdb', ['$http', '$rootScope', 
  function ($http, $rootScope) {
        var obj = {}
        
        obj.getservers = function (callback) {
            $http.get("/controller/servers")
			.success(callback)
			.error(function () { callback(null); });
        };
                
        obj.deleteserver = function (id, callback) {
            $http.delete("/controller/server/" + id)
			.success(callback)
			.error(function () { callback("Unable to delete server."); });
        }
        
        obj.updateserver = function (server, callback) {
            $http.put("/controller/server", server)
			.success(callback.bind(null, null))
			.error(function () { callback("Unable to update the server."); });
        }
        
        obj.addserver = function (server, callback) {
            $http.post("/controller/server", server)
			.success(callback.bind(null, null))
			.error(function (err) { console.dir(err);callback("Unable to add the server."); });
        }
        
        return obj;
    }]);

app.controller('servercontroller', ["$rootScope", "$scope", "$window", "serverdb", 'alarmevents', 'device', function ($rootScope, $scope, $window, serverdb, alarmevents, device) {
        
        $scope.currentserver = undefined;
        $scope.serverMsg = undefined;
        $scope.servers = [];
        $scope.originalServers = [];
        $scope.device = device;

        $scope.back = function(){
            $window.location.href = '/accountsettings';
        }
        
        serverdb.getservers(function (data){
            $scope.servers = data;
            $scope.originalServers = angular.copy($scope.servers);
        });

        var updateMessage = function (err) {
            $scope.serverMsg = err ? ("Une erreur s'est produite : " + err) : this+"";
        }
        
        $scope.initemptyserver = function () {
            $scope.currentServer = {
                address: "",
                port: 4000,
                username: "admin",
                password: "",
                description: ""
            };

            $scope.serverMsg = undefined;
        }

        $scope.reset = function(){
            $scope.servers = angular.copy($scope.originalServers);
            $scope.serversForm.$setPristine();
        }
        
        $scope.deleteServer = function (id) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(id);
            if (pos == -1 || !$window.confirm("Are you sure you want to delete the server " + $scope.servers[pos].login))
                return;
            
            $scope.serverMsg = "Deleting server...";
            serverdb.deleteserver(id, function (err) {
                updateMessage.call("Le serveur a bien été supprimé", err);
                if (!err)
                    $scope.servers.splice(pos, 1);
            });

        };
        
        $scope.editServer = function (id) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(id);
            $scope.currentServer = JSON.parse(JSON.stringify($scope.servers[pos]));
            $scope.serverMsg = undefined;
        };
        
        $scope.commitCurrentServer = function () {
            $scope.serverMsg = "Sending data...";
            
            if ($scope.currentServer.id)
                serverdb.updateserver($scope.currentServer, function (err, newserver) {
                    updateMessage.call("Vos modifications ont été enregistrées", err);
                    if (!err) {
                        var pos = $scope.servers.map(function (e) { return e.id; }).indexOf($scope.currentServer.id);
                        $scope.servers[pos] = $scope.currentServer;
                        $scope.currentServer = undefined;
                    }
                })
            else
                serverdb.addserver($scope.currentServer, function (err, newserver) {
                    updateMessage.call("Le serveur a bien été ajouté", err);
                    if (!err) {
                        $scope.currentServer = undefined;
                        $scope.servers.push(newserver);
                    }
                })
        };


        var statusUpdate = function (event, data) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(data.id);
            if (pos >= 0){
                $scope.servers[pos].connected = data.connected;
                if (!data.connected){
                    $scope.sendnotification("Connexion au serveur " + $scope.servers[pos].description + " (" + $scope.servers[pos].address + ") impossible", false, 1000);
                } else {
                    // Think about how to clear notifications
                }
            }
        };
        
        var unbind = $rootScope.$on("connection", statusUpdate);
        $scope.$on('$destroy', unbind);

    }]);