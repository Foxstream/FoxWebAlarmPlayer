var auth = require("../Authenticator.js"),
    async = require('async'),
    events = require('events'),
    fs = require('fs');

function applyApp(app){
    var self = this;

     app.get('/cameras', function(req, res){
       
        var cameras = {},
            servers = self.serversManager.servers;

            servers.forEach(function(s){
                if (s.xmlclient.Configuration){
                    var cameraList = s.xmlclient.Configuration.cameras.map(function(c){
                        c.serverId = s.config.id;
                        return c;
                    });
                    var site = s.xmlclient.Configuration.equipment.site;
                    if (site in cameras){
                        cameras[site] = cameras[site].concat(cameraList);
                    } else {
                        cameras[site] = cameraList;
                    }
                }
            });

            if (Object.keys(cameras).length === 0){
                res.status(204);
                res.end();
            } else {
                res.status(200);
                res.send(cameras);
            }

    });

     app.get('/cameras/:server/:camid/live', function(req, res){
        // Get the right server by its id
        var server = undefined;
        self.serversManager.servers.some(function(s){
            if (s.config.id == req.params.server){
                server = s;
                return true;
            } else {
                return false;
            }
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
                        res.status(200);
                        res.send(img.image[0].data);
                    }
                });
        }
     });

}

function LiveController(serversManager) {
    if (!this) return new LiveController(serversManager);

    this.serversManager = serversManager;
}

LiveController.prototype.ApplyLiveRoutes = applyApp;

module.exports = LiveController;