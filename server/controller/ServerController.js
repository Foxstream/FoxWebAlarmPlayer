var auth = require("../Authenticator.js");

function applyApp(app) {
    var self = this;

    // !! use auth.IsUser
    // Even when user should change password, we want to display the connection errors
    app.get('/servers', auth.IsUser, function(req, res){
        self.serverManager.getservers(function (err, data) {
            if (err){
                res.status(500);
                res.send(err);
            }
            else {
                res.status(200);
                res.json(data);
            }
            res.end();
        });
    });

    app.get('/servers/:serverid', auth.IsAdmin, function(req, res){

        self.serverManager.getserver(req.params.serverid, function (err, data) {
            if (err){
                if (err === "Not found"){
                    res.status(204);
                    res.end();
                } else {
                    res.status(500);
                    res.send(err);
                }
            }
            else {
                res.status(200);
                res.json(data);
            }
        });

    });


    app.put('/servers/:serverid', auth.IsAdmin, function(req, res){
        var server = req.body;
        if (server.id != req.params.serverid){

            res.status(400);
            res.end("Wrong server id");

        } else {
            // Check that userid matches a user or send 404
            self.serverManager.getserver(req.params.serverid, function(err, data){
                if (data){
                    if (server.address && server.description && server.port > 0 && server.username && server.password){
                        self.serverManager.updateserver(server, function (err) {
                            if (err){
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





// ------------------------------------------------------------
//------------------------------------------------------------
//-------------------------------------------------------
    app.get('/controller/servers', auth.IsUser, function (req, res) {
        self.serverManager.getservers(function (err, data) {
            if (data){
                res.json(data);
            }
            else {
                res.status(402);
                res.send(err);
            }
            res.end();
				
        });
    });
    
    app.get('/controller/server/:serverid', auth.IsValidUser, function (req, res) {
        self.serverManager.getserver(req.params.serverid, function (err, data) {
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
        self.serverManager.updateserver(server, function (err) {
            if (!err){
                res.json(server);
            }
            else {
                res.status(404);
                res.send(err);
            }
            res.end();
        });
    });
    
    app.post('/controller/server', auth.IsAdmin, function (req, res) {
        var server = req.body;
        self.serverManager.addserver(server, function (err) {
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
        self.serverManager.removeserver(req.params.serverid, function (err) {
            res.status(err ? 404 : 200);
            res.end(err);
        });
    });
}

function serverController(serverManager) {
    if (!this) return new serverController(serverManager);
    
    this.serverManager = serverManager;
}

serverController.prototype.ApplyServerRoutes = applyApp;


module.exports = serverController;
