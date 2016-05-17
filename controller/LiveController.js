var auth = require("../Authenticator.js");
var sys = require('sys');
var events = require('events');

function applyApp(app){
    var self = this;

    app.get('/controller/live', function(req, res){
        res.send('Live image requested');
    });
}

function LiveController(serverManager) {

}

LiveController.applyApp = applyApp;

module.exports = LiveController;