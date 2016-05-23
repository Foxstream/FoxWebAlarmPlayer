var auth = require("../Authenticator.js");

function applyApp(app) {
    var self = this;
    app.get('/controller/servers', auth.IsValidUser, function (req, res) {
        self.serverPersistence.getservers(function (err, data) {
            if (data)
                res.json(data);
            else {
                res.status(402);
                res.send(err);
            }
            res.end();
				
        });
    });
    
    app.get('/controller/server/:serverid', auth.IsValidUser, function (req, res) {
        self.serverPersistence.getserver(req.params.serverid, function (err, data) {
            if (data)
                res.json(data);
            else {
                res.status(404);
                res.send(err);
            }
            res.end();				
        });
    });

    app.put('/controller/server', auth.IsAdmin, function (req, res) {
        var server = req.body;
        self.serverPersistence.updateserver(server, function (err) {
            if (!err)
                res.json(server);
            else {
                res.status(404);
                res.send(err);
            }
            res.end();
        })
    });
    
    app.post('/controller/server', auth.IsAdmin, function (req, res) {
        var server = req.body;
        self.serverPersistence.addserver(server, function (err) {
            if (!err)
                res.json(server);
            else {
                res.status(404);
                res.send(err);
            }
            res.end();
        })
    });
    
    app.delete('/controller/server/:serverid', auth.IsAdmin, function (req, res) {
        self.serverPersistence.removeserver(req.params.serverid, function (err) {
            res.status(err ? 404 : 200);
            res.end(err);
        });
    });
}

function serverController(serverPersistence) {
    if (!this) return new serverController(serverPersistence);
    
    this.serverPersistence = serverPersistence;
}

serverController.prototype.ApplyServerRoutes = applyApp;


module.exports = serverController;
