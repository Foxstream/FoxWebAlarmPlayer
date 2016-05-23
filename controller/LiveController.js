var auth = require("../Authenticator.js"),
    sys = require('sys'),
    async = require('async'),
    events = require('events'),
    fs = require('fs');

function applyApp(app){
    var self = this;

     app.get('/controller/live/cameras', function(req, res){

        console.log('Building camera list');
       
        var cameras = {},
            servers = self.serverManager.servers;

        async.each(servers, function(s, cb){
            s.xmlclient.send({
                "$": {
                    type:"state",
                    id:1
                }}, function(err, state){
                    if (!err){
                        // Store the server in each camera to be ablt to ask for live
                        // pictures later
                        var cameraList = state.camera.map(function(c){
                            c.$.serverId = s.config.id;
                            return c.$;
                        });
                        var site = s.config.site;
                        // Add cameras to the list
                        if (site in cameras){
                            cameras[site] = cameras[site].concat(cameraList);
                        } else {
                            cameras[site] = cameraList;
                        }
                        cb(); 
                    } 
                });
        }, function(){
            console.log(cameras)
            res.send(cameras);
        });
    });
}

function LiveController(serverManager) {
    if (!this) return new LiveController(serverManager);

    this.serverManager = serverManager;
}

LiveController.prototype.ApplyLiveRoutes = applyApp;

module.exports = LiveController;