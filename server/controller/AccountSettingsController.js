var auth = require("../Authenticator.js");
var config = require("config");
var version = require('../ProductVersion');

function applyApp(app, userPers) {
    var self = this;
   
    app.get('/accountsettings', auth.IsUser, function (req, res) {
        res.render('accountsettings', { user: req.user, appName: config.get('appName'), version : version});    
    });

}


module.exports = applyApp;