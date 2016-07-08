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
    
    app.get('/controller/user/me', auth.IsValidUser, function(req, res){
        console.log('\nok\n');
        res.send(req.user);
    });

    app.get('/controller/user/:userid', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUser(req.params.userid, function (err, data) {            
            if (data)
                res.json(data);
            else {
                res.status(404);
                res.send(err);
            }
            res.end();
				
        });
    });

    app.put('/controller/user', auth.IsAdmin, function (req, res) {
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

    app.post('/controller/user/:userid/resetpassword', auth.IsAdmin, function (req, res) {
        self.UserPersistence.getUser(req.params.userid, function (err, data) {
            if (data) {
                data.password = undefined //reset du mdp
                self.UserPersistence.updateUser(req.params.Userid, data, function (err) {
                    res.status(err ? 404 : 200);
                    res.end(err);
                })
            }
            else {
                res.status(404);
                res.end(err);
            }            				
        });
    });
    
    app.post('/controller/user/new', auth.IsAdmin, function (req, res) {
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
    
    app.delete('/controller/user/:userid', auth.IsAdmin, function (req, res) {
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
