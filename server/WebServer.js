var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var expressSession = require('express-session');
var auth = require('./Authenticator.js');
var fs = require('fs');
var config = require('config');
var version = require('./ProductVersion');


function buildWebServer(){    
    var app = express();
	app.use(favicon(__dirname + '/../client/img/icon-foxstream.gif'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressSession({
        secret: 'azzfze6498ze7f9zef64f846&"(54f6efzeze',
        resave : false,
        saveUninitialized : true,
        cookie: { httpOnly: true }
    }));

    app.use('/', express.static(__dirname + '/../client'));
    
    app.set('views', __dirname + '/../client/views');
    app.set('view engine', 'pug');
    
    return app;
}

function getDefaultParamObject(req)
{
	return { user: req.user, appName: config.get('appName'), version : version };
}

function applyRoutes(app) {
        
    app.get('/', function (req, res) {   
        res.redirect("/alarmview");
    });

    app.get('/alarmview', auth.IsValidUser, function (req, res) {
        res.render('alarmview', getDefaultParamObject(req));
    });

    app.get('/live', auth.IsValidUser, function (req, res) {
        res.render('liveview',  getDefaultParamObject(req));
    });
    
    app.get('/userview', auth.IsAdmin, function (req, res) {
        res.render('userview',  getDefaultParamObject(req));
    });
    
    app.get('/serverview', auth.IsAdmin, function (req, res) {
        res.render('serverview',  getDefaultParamObject(req));
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

    app.get('/log/old', auth.IsAdmin, function(req, res){
        fs.readFile(config.get('logFile')+'.old', 'utf-8', function(err, data){
            if (err){
                res.status(500);
                res.send(err);
            } else {
                if (data){
                    res.status(200);
                    res.send(data);
                } else {
                    res.status(204);
                    res.end();
                }
            }
        })
    });

    app.get('/logview', auth.IsAdmin, function(req, res){
        res.render('logview', { user: req.user, appName: config.get('appName')  });
    });

    app.get('/logviewer', auth.IsAdmin, function(req, res){
        res.render('logviewer');
    });

}

module.exports.BuildWebServer = buildWebServer;
module.exports.ApplyMainRoutes = applyRoutes;