﻿var passport = require("passport");
var passportlocal = require("passport-local").Strategy;
var config = require("config");

function isUser(req, res, next)
{
    var bAuth = req.hasOwnProperty("user");
    
    if (bAuth){
        next();
    } else {
        res.redirect("/login");
    }
}

function isValidUser(req, res, next){
    isUser(req, res, function (){
        if (req.user.shouldChangePassword && !req.body.oldPassword && !req.body.newPassword){
            res.redirect("/accountsettings");
        }
        else {
            next();
        }
    });
}

function isAdmin(req, res, next) {
    isValidUser(req, res, function () {
        if (req.user.type !== 1){
            res.redirect("/");
        } else {
            next();
        }
    });
}

function applyToServer(app, userPers)
{
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(userPers.getUser.bind(userPers));
    passport.use(new passportlocal(userPers.checkUser.bind(userPers)));

    app.get('/login', function (req, res) {
        if (req.user){
            res.redirect('/');
        } else {
            res.render('login', {appName: config.get('appName'), status: 200 });
        }
    });
    
    app.post('/login', function(req, res, next){
        if (req.body.password == '')
            req.body.password = ' '; // Passport doesn't accept empty passwords
        passport.authenticate('local', function(err, user, info) {
            if (err){
                return next(err);
            }
            if (!user){ 
                return res.render('login', {status: 401});
            }
            req.logIn(user, function(err){
                if (err){ 
                    return res.render('login', {status: 401});
                }
                return res.redirect('/');
            });
        })(req, res, next);
    });
    
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

}

module.exports.IsUser = isUser;
module.exports.IsValidUser = isValidUser;
module.exports.IsAdmin = isAdmin;
module.exports.ApplyToServer = applyToServer;