var auth = require("../Authenticator.js");

function applyApp(app) {
    var self = this;
    app.get('/controller/users', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUsers(function (err, data) {
            if (data)
                res.json(data);
            else {
                res.status(402);
                res.send(err);
            }
            res.end();
				
        });
    });
    
    app.get('/controller/users/me', auth.IsValidUser, function(req, res){
        res.send(req.user);
    });

    app.get('/controller/users/:userid', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUser(req.params.userid, function (err, data) {            
            if (err){
                res.status(500);
                res.send(err);
            }
            else {
                res.status(200);
                if (data){
                    res.json(data);
                }
                res.end();
            }
        });
    });

    // Updating any user (admin only)
    app.put('/controller/users', auth.IsAdmin, function (req, res) {
        var user = req.body;
        self.UserPersistence.updateUser(user, function (err) {
            if (!err){
                res.json(user);
            }
            else {
                res.status(404);
                res.send(err);
            }
            res.end();
        });
    });

    // Updating oneself (any user)
    app.put('/controller/users/me', auth.IsValidUser, function (req, res) {
        var user = req.body;
        if (user.id !== req.user.id){
            res.status(500);
            res.send("Not allowed");
            res.end();
        } else {
            self.UserPersistence.updateUser(user, function (err) {
                if (!err){
                    res.json(user);
                }
                else {
                    res.status(404);
                    res.send(err);
                }
                res.end();
            });
        }
    });

    app.post('/controller/users/:userid/resetpassword', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUser(req.params.userid, function (err, data) {
            if (data) {
                data.password = undefined; //reset du mdp
                self.UserPersistence.updateUser(req.params.Userid, data, function (err) {
                    res.status(err ? 404 : 200);
                    res.end(err);
                });
            }
            else {
                res.status(404);
                res.end(err);
            }            				
        });
    });

    app.post('/controller/users/me/password', auth.IsValidUser, function (req, res) {
        var user = req.body.user;
        if (user.id !== req.user.id){
            res.status(500);
            res.send("Not allowed");
            res.end();
        } else {
            // check current password
            self.UserPersistence.checkUser(user.login, req.body.oldPassword, function(err, user){
                if (err || !user){
                    res.status(500);
                    res.send("Le mot de passe saisi est incorrect");
                    res.end();
                } else {
                    user.password = req.body.newPassword;
                    self.UserPersistence.updateUser(user, function(err, data){
                        res.status(err ? 404 : 200);
                        res.end(err);
                    });
                }
            });
        }
    });

    
    app.post('/controller/users/new', auth.IsAdmin, function (req, res) {
        // var user = { login: req.body.login, displayname: req.body.login, password: "", type: 0 };
        var user = req.body;
        self.UserPersistence.addUser(user, function (err) {
            if (!err)
                res.json(user);
            else {
                res.status(404);
                res.send(err);
            }
            res.end();
        })
    });
    
    app.delete('/controller/users/:userid', auth.IsAdmin, function (req, res) {
        self.UserPersistence.deleteUser(req.params.userid, function (err) {
            res.status(err ? 404 : 200);
            res.end(err);
        });
    });   
}

function UserController(UserPersistence) {
    if (!this) return new UserController(UserPersistence);
    
    this.UserPersistence = UserPersistence;
}

UserController.prototype.ApplyUserRoutes = applyApp;


module.exports = UserController;
