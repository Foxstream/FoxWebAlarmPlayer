var auth = require("../Authenticator.js"),
    sys = require('sys'),
    async = require('async'),
    events = require('events');

function applyApp(app){
    var self = this;

    app.get('/controller/live/cameras', function(req, res){
       
        var cameras = [],
            servers = self.serverManager.servers;

        async.each(servers, function(s, cb){
            s.xmlclient.send({
                "$": {
                    type:"state",
                    id:1,
                }}, function(err, state){
                    if (!err){
                        // var serverId = servers[servers.indexOf(s)].config.id;
                        
                        // Get a picture for each camera
                        // async.each(state.camera, function(c, callback){
                        // }, function(){

                        // });
                        state.camera.forEach(function(c){
                            cameras.push(c.$);
                        });
                    }
                    cb();
                });
        }, function(){
            console.log(cameras);
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