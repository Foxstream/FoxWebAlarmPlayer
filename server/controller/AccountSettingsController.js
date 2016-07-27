var auth = require("../Authenticator.js");

function applyApp(app, userPers) {
    var self = this;
    
    var showErrorMessage= function(req, res, errMsg)
    {
        res.render('accountsettings', { user: req.user, message: errMsg});
    }
    
    app.get('/accountsettings', auth.IsUser, function (req, res) {
        showErrorMessage(req, res);
    });
    
    
    app.post('/accountsettings', auth.IsUser, function (req, res) {
        if (req.body.PropUpdate && req.body.username && req.body.username.length>0) {
            req.user.displayname = req.body.username;
            userPers.updateUser(req.user, function (err) { 
                res.redirect("/");
            })            
        } else if (req.body.PassUpdate && req.body.password1 && req.body.password2) {
            if (req.body.password1 == req.body.password2) {
                userPers.checkUser(req.user.login, req.body.oldpassword, function (err) {
                    if (err)
                        showErrorMessage(req, res, "Old does not match password");
                    else {
                        var clonedUser = req.user;
                        clonedUser.password = req.body.password1;
                        userPers.updateUser(clonedUser, function (err) {
                            if (err)
                                showErrorMessage(req, res, "Unable to change password "+err);
                            else
                                res.redirect("/");
                        });
                        
                    }

                })
            }
            else
                showErrorMessage(req, res, "Passwords does not match");
        }
        else
            res.redirect("/");
    });
}


module.exports = applyApp;