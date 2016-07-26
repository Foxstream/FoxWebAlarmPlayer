var auth = require("../Authenticator.js");

function applyApp(app) {
    var self = this;

    app.get('/users', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUsers(function (err, data) {
            if (err){
                res.status(500);
                res.send("Database error : ", err);            
            }
            else {
                res.status(401);
                res.send("Access denied");
            }
            res.end();
        });
    });
    
    app.get('/users/me', auth.IsUser, function(req, res){
        res.status(200);
        res.send(req.user);
    });

    app.get('/users/:userid', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUser(req.params.userid, function (err, data) {            
            if (err){
                res.status(500);
                res.send(err);
            }
            else {
                if (data){
                    res.status(200);
                    res.json(data);
                } else {
                    res.status(204);
                }
                res.end();
            }
        });
    });

    app.put('/users/me/displayname', auth.IsValidUser, function(req, res){
        if (req.body.displayname){
            var user = req.user;
            user.displayname = req.body.displayname;
            self.UserPersistence.updateUser(user, function(err){
                if (err){
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.end();
                }
            });
        } else {
            res.status(400);
            res.send('Bad request : displayname missing or empty');
        }
    });

    app.put('/users/me/password', auth.IsValidUser, function(req, res){
        var user = req.user;
        if (req.body.oldPassword !== undefined && req.body.newPassword !== undefined){
            self.UserPersistence.checkUser(user.login, req.body.oldPassword, function(err, user){
                if (err || !user){
                    res.status(401);
                    res.send("Le mot de passe saisi est incorrect");
                } else {
                    user.password = req.body.newPassword;
                    self.UserPersistence.updateUser(user, function(err, data){
                        if (err){
                            console.log(err)
                            res.status(500);
                            res.send(err);
                        } else {
                            res.status(200);
                            res.end();
                        }
                    });
                }
            });
        } else {
            res.status(400);
            res.send("Bad request : missing parameter");
        }
    });

    app.put('/users/:userid', auth.IsAdmin, function(req, res){
        var user = req.body;

        // Check that userid corresponds to a user or send 404
        self.UserPersistence.getUser(req.params.userid, function(err, data){
            if (data){
                if (user.displayname && (user.type === 0 || user.type === 1)){
                    self.UserPersistence.updateUser(user, function (err, data) {
                        if (err){
                            res.status(500);
                            res.send(err);
                        } else {
                            res.status(200);
                        }
                        res.end();  
                    });
                } else {
                    res.status(400);
                    res.send("Bad request : parameters type and displayname are required");
                }
            } else {
                res.status(404);
                res.send('User not found');
            }
        });
    });

    app.put('/users/:userid', auth.IsAdmin, function(req, res){
        var user = req.body;

        if (user.id != req.params.userid){
            res.status(400);
            res.end();
        } else {

            // Check that userid matches a user or send 404
            self.UserPersistence.getUser(req.params.userid, function(err, data){
                if (data){
                    if (user.displayname && (user.type === 0 || user.type === 1)){
                        self.UserPersistence.updateUser(user, function (err, data) {
                            if (err){
                                res.status(500);
                                res.send(err);
                            } else {
                                res.status(200);
                            }
                            res.end();  
                        });
                    } else {
                        res.status(400);
                        res.send("Bad request : parameters type and displayname are required");
                    }
                } else {
                    res.status(404);
                    res.send('User not found');
                }
            });

        }
    });
    
    app.post('/users', auth.IsAdmin, function (req, res) {
        var user = req.body;
        if (user.login && user.displayname && (user.type === 0 || user.type === 1)){
            self.UserPersistence.addUser(user, function (err){
                if (err){
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send();
                }
            });  
        } else {
            res.status(400);
            res.send("Bad request : user information missing");
        }
    });

    app.post('/users/:userid/resetPassword', auth.IsAdmin, function(req, res){
        self.UserPersistence.getUser(req.params.userid, function(err, user){
            if (err){
                res.status(500);
                res.send(err);
            } else if (!user){
                res.status(404);
                res.send("User " + req.params.userid + "doesn't exist");
            } else {
                self.UserPersistence.resetUser(req.params.userid, function(err){
                    if (err){
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.end();
                    }
                });
            }
        })
    });
    
    app.delete('/users/:userid', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUser(req.params.userid, function(err, user){
            if (err){
                res.status(500);
                res.send(err);
            } else if (!user){
                res.status(404);
                res.send("User " + req.params.userid + "doesn't exist");
            } else {
                self.UserPersistence.deleteUser(req.params.userid, function (err) {
                    if(err){
                        res.status(500);
                        res.send(err);
                    } else {
                        res.status(200);
                        res.end();
                    }
                });
            }
        });
    });
}

function UserController(UserPersistence) {
    if (!this) return new UserController(UserPersistence);
    
    this.UserPersistence = UserPersistence;
}

UserController.prototype.ApplyUserRoutes = applyApp;

module.exports = UserController;