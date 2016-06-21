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

        servers.forEach(function(s){
            if (!s.xmlclient.Configuration){
                res.status(500);
                res.end();
            } else {
                debugger;
                var cameraList = s.xmlclient.Configuration.cameras.map(function(c){
                    c.serverId = s.config.id;
                    return c;
                });
                console.log(cameraList);
                var site = s.xmlclient.Configuration.equipment.site;
                if (site in cameras){
                    cameras[site] = cameras[site].concat(cameraList);
                } else {
                    cameras[site] = cameraList;
                }
            }
        });
        res.send(cameras);

    });

     app.get('/controller/live/:server/:camid', function(req, res){
        console.log('Received request for live image')
        console.log('server', req.params.server);
        console.log('camera', req.params.camid);
        // Get the right server by its id
        var server = undefined;
        self.serverManager.servers.some(function(s){
            if (s.config.id == req.params.server){
                server = s;
                return true;
            } else return false;
        });
        // Ask for image for the right camera
        if (!server){
            res.status(500);
            res.send(null);
        } else {
            server.xmlclient.send({
                "$": {
                    type:'live',
                    mode: 'jpg',
                    camid: req.params.camid
                }}, function(err, img){
                    if (err){ 
                        res.status(500);
                        res.send(err);
                    } else {
                        res.send(img.image[0].data);
                    }
                });
        }
     });

}

function LiveController(serverManager) {
    if (!this) return new LiveController(serverManager);

    this.serverManager = serverManager;
}

LiveController.prototype.ApplyLiveRoutes = applyApp;

module.exports = LiveController;