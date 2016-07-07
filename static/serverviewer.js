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
        
        $scope.newserver = undefined;
        $scope.currentserver = undefined;
        $scope.serverMsg = undefined;
        $scope.servers = [];
        $scope.pristineServerData = [];
        $scope.device = device;

        $scope.back = function(){
            $window.location.href = '/accountsettings';
        }
        
        // TODO (callback)
        serverdb.getservers(function (data){
            $scope.servers = data;
            $scope.pristineServerData = angular.copy($scope.servers);
        });

        var updateMessage = function (err) {
            $scope.serverMsg = err ? ("Une erreur s'est produite : " + err) : this+"";
        }
        
        $scope.initemptyserver = function () {
            $scope.newserver = {
                address: "",
                port: 4000,
                username: "admin",
                password: "",
                description: ""
            };
        };

        $scope.editserver = function(serverId){
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(serverId);
            $scope.currentserver = angular.copy($scope.servers[pos]);
        }

        $scope.resetserver = function(){
            $scope.currentserver = undefined;
        }

        $scope.deleteserver = function (serverId) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(serverId);
            if (pos === -1 || !$window.confirm("Voulez-vous vraiment supprimer le serveur " + $scope.servers[pos].description + " ?")){
                return;
            }
            $scope.serverMsg = "Suppression du serveur..."; // TODO
            serverdb.deleteserver(serverId, function (err){
                if (!err){
                    updateMessage.call("Le serveur a bien été supprimé", err);
                    $scope.servers.splice(pos, 1);
                }
            });
        };

        $scope.commitcurrentserver = function(){
            serverdb.updateserver($scope.currentserver, function(err, newserver){
                if (err){
                    updateMessage.call("Une erreur s'est produite.");
                } else {
                    updateMessage.call("Vos modifications ont été enregistrées.");
                    var pos = $scope.servers.map(function (e) { return e.id; }).indexOf($scope.currentserver.id);
                    $scope.servers[pos] = $scope.currentserver;
                    $scope.resetserver();
                }
            });
        }

        $scope.commitnewserver = function(){
            serverdb.addserver($scope.newserver, function (err, newserver) {
                    updateMessage.call("Le serveur a bien été ajouté", err);
                    if (!err) {
                        $scope.newserver = undefined;
                        $scope.servers.push(newserver);
                    }
                });
        };


        var statusUpdate = function (event, server) {
            var pos = $scope.servers.map(function (e) { return e.id; }).indexOf(server.id);
            if (pos >= 0){
                $scope.servers[pos] = angular.copy(server);
                if (!server.connected){

                    var disconnectedServers = $scope.servers.filter(function(s){ return !s.connected; });
                    if (disconnectedServers.length > 1){

                        var message = "Impossible de se connecter aux serveurs : ";
                        disconnectedServers.forEach(function(s, index){
                            message += s.description + " (" + s.address + ")"
                            if (index !== disconnectedServers.length - 1){
                                message += ", ";
                            }
                        });
                        $scope.sendnotification(message, false, 1000);

                    } else {

                        $scope.sendnotification("Connexion au serveur " + $scope.servers[pos].description + " (" + $scope.servers[pos].address + ") impossible", false, 1000);

                    }

                } else {
                    $scope.sendnotification("Connexion au serveur " + $scope.servers[pos].description + " (" + $scope.servers[pos].address + ") établie", true, 1000);
                }
            }
        };
        
        var unbind = $rootScope.$on("connection", statusUpdate);
        $scope.$on('$destroy', unbind);

    }]);