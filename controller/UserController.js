var auth = require("../Authenticator.js");

function applyApp(app) {
    var self = this;

    app.get('/users', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUsers(function (err, data) {
            if (err){
                res.status(500);
                res.send(err);            
            }
            else {
                res.json(data);
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
                    res.status(404);
                }
                res.end();
            }
        });
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

    app.put('/users/me', auth.IsValidUser, function(req, res){
        
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


    app.post('/controller/users/me/changeemptypassword', auth.IsUser, function (req, res) {
        var user = req.body.user;
        if (user.shouldChangePassword !== 1){
            res.status(500);
            res.send("Current password is not empty");
        }

        if (user.id !== req.user.id){
            res.status(500);
            res.send("Not allowed");
            res.end();
        } else {
            user.password = req.body.newPassword;
            self.UserPersistence.updateUser(user, function(err, data){
                res.status(err ? 404 : 200);
                res.end(err);
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