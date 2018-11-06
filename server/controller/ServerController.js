var auth = require("../Authenticator.js");

function applyApp(app) {
    var self = this;

    // !! use auth.IsUser !!
    // Even when user should change password, we want to display the connection errors
    app.get('/servers', auth.IsUser, function(req, res) {
        self.serverManager.getservers(function(err, data) {
            if (err) {
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.json(data);
            }
            res.end();
        });
    });

    app.get('/servers/:serverid', auth.IsAdmin, function(req, res) {

        self.serverManager.getserver(req.params.serverid, function(err, data) {
            if (err) {
                if (err === "Not found") {
                    res.status(204);
                    res.end();
                } else {
                    res.status(500);
                    res.send(err);
                }
            } else {
                res.status(200);
                res.json(data);
            }
        });

    });


    app.put('/servers/:serverid', auth.IsAdmin, function(req, res) {
        var server = req.body;
        if (server.id != req.params.serverid) {

            res.status(400);
            res.end("Wrong server id");

        } else {
            // Check that userid matches a user or send 404
            self.serverManager.getserver(req.params.serverid, function(err, data) {
                if (data) {
                    if (server.address && server.description && server.port > 0 && server.username && server.password) {
                        self.serverManager.updateserver(server, function(err) {
                            if (err) {
                                res.status(500);
                                res.send("Database error: " + err);
                            } else {
                                res.status(200);
                            }
                            res.end();
                        });
                    } else {
                        res.status(400);
                        res.send("Bad request : parameters address, description, port, username and password expected.");
                    }
                } else {
                    res.status(404);
                    res.send('Server not found');
                }
            });
        }
    });

    app.post('/servers', auth.IsAdmin, function(req, res) {
        var server = req.body;
        if (server.address && server.port > 0 && server.username && server.password && server.description) {
            self.serverManager.addserver(server, function(err, newServer) {
                if (err) {
                    res.status(500);
                    res.send(err);
                } else {
                    res.status(200);
                    res.send(newServer);
                }
            });
        } else {
            res.status(400);
            res.send('Bad request: parameters address, port, username, password and description are expected.');
        }
    });

    app.delete('/servers/:serverid', auth.IsAdmin, function(req, res) {
        self.serverManager.getserver(req.params.serverid, function(err, server) {
            if (err) {
                if (err === "Not found") {
                    res.status(404);
                    res.send("Server " + req.params.serverid + "doesn't exist");
                } else {
                    res.status(500);
                    res.send(err);
                }
            } else {
                self.serverManager.removeserver(req.params.serverid, function(err) {
                    if (err) {
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

    app.post('/servers/enable', auth.IsAdmin, function(req, res) {
        self.servverManager.enableanalysis(false);
        res.status(200);
        res.end();
    });

    app.post('/servers/disable', auth.IsAdmin, function(req, res) {
        self.servverManager.enableanalysis(true);
        res.status(200);
        res.end();
    });

}

function serverController(serverManager) {
    if (!this) return new serverController(serverManager);

    this.serverManager = serverManager;
}

serverController.prototype.ApplyServerRoutes = applyApp;


module.exports = serverController;