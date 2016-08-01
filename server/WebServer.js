var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var auth = require('./Authenticator.js');
var fs = require('fs');
var config = require('config');


function buildWebServer(){    
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressSession({
        secret: 'azzfze6498ze7f9zef64f846&"(54f6efzeze',
        resave : false,
        saveUninitialized : true,
        cookie: { httpOnly: true }
    }));
    
    app.use('/', express.static(__dirname + '/../client'));
    
    app.set('views', __dirname + '/../client/views')
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

    app.get('/live', auth.IsValidUser, function (req, res) {
        res.render('liveview', { user: req.user });
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

    app.get('/liveplayer', auth.IsValidUser, function (req, res) {
        res.render('liveplayer');
    });

    app.get('/swiper', auth.IsValidUser, function (req, res) {
        res.render('swiper');
    });

    app.get('/liveswiper', auth.IsValidUser, function (req, res) {
        res.render('liveswiper');
    });


    app.get('/log', auth.IsAdmin, function(req, res){
        fs.readFile(config.get('logFile'), 'utf-8', function(err, data){
            if (err){
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.send(data);
            }
        })
    });

    app.get('/logview', auth.IsAdmin, function(req, res){
        res.render('logview', { user: req.user });
    });


}

module.exports.BuildWebServer = buildWebServer;
module.exports.ApplyMainRoutes = applyRoutes;