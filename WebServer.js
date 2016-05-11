var express = require('express')
var bodyParser = require('body-parser')
var expressSession = require('express-session');
var auth = require("./Authenticator.js")


function buildWebServer()
{    
    var app = express()
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressSession({
        secret: 'azzfze6498ze7f9zef64f846&"(54f6efzeze',
        resave : false,
        saveUninitialized : true,
        cookie: { httpOnly: true }
    }));
    
    app.use('/static', express.static(__dirname + '/static'));
    
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    

    return app;
}

function applyRoutes(app) {
        
    app.get('/', function (req, res) {        
        res.redirect("/alarmview");        
    });         

    app.get('/alarmview', auth.IsValidUser, function (req, res) {
        res.render('alarmview', { user: req.user });
    });
    
    app.get('/userview', auth.IsAdmin, function (req, res) {
        res.render('userview', { user: req.user });
    });
    
    app.get('/serverview', auth.IsAdmin, function (req, res) {
        res.render('serverview', { user: req.user });
    });
    
    app.get('/imageplayer', auth.IsValidUser, function (req, res) {
        res.render('imageplayer');
    });

}

module.exports.BuildWebServer = buildWebServer;
module.exports.ApplyMainRoutes = applyRoutes;
