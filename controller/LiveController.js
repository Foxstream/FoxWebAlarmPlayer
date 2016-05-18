var auth = require("../Authenticator.js"),
    sys = require('sys'),
    async = require('async'),
    events = require('events'),
    fs = require('fs');

function applyApp(app){
    var self = this;

    app.get('/controller/live/cameras', function(req, res){
       
        var cameras = [],
            servers = self.serverManager.servers;

        /**
          * This piece of code is awful, it has to be rewritten as soon as possible
          */
        async.each(servers, function(s, cb){
            // For each server, get the list of cameras
            s.xmlclient.send({
                "$": {
                    type:"state",
                    id:1
                }}, function(err, state){
                    // We now want a live image from each camedra
                    if (!err){
                        async.each(state.camera, function(c, callback){
                            c.$.serverId = s.config.id;
                            var camid = c.$.camid;
                            s.xmlclient.send({
                                "$": {
                                    type:'live',
                                    mode: 'jpg',
                                    camid: camid
                                }}, function(err, img){
                                    if (!err){
                                        c.$.image = img.image[0].data;
                                    }
                                    callback();
                                });
                        }, function(){ 
                            // At this point, all cameras connected to the server s have been fetched 
                            // and a live image has been associated to each of them
                            state.camera.forEach(function(c){
                                cameras.push(c.$);
                            });
                            cb();
                        });
                    }
                });
        }, function(){
            // At this point, all servers have been considered and we can send the data to the client
            console.log('cameras', cameras);
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