var passport = require("passport");
var passportlocal = require("passport-local").Strategy;

function isUser(req, res, next)
{
    var bAuth = req.hasOwnProperty("user");
    
    if (bAuth){
        next();
    }
    else{
        res.redirect("/login");
    }
}

function isValidUser(req, res, next) {
    
    isUser(req, res, function (){
        if (req.user.shouldChangePassword)
            res.redirect("/accountsettings");
        else
            next();
    });
}

function isAdmin(req, res, next) {
    isValidUser(req, res, function () {
        if (req.user.type !== 1)
            res.redirect("/");
        else
            next();
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
        res.render('login');
    });
    
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

}

module.exports.IsUser = isUser;
module.exports.IsValidUser = isValidUser;
module.exports.IsAdmin = isAdmin;
module.exports.ApplyToServer = applyToServer;
