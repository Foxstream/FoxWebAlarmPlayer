var async = require("async");

function open(cb) {
    var self = this;
    this.db.run("CREATE TABLE IF NOT EXISTS server (id INTEGER PRIMARY KEY, address TEXT, port INTEGER, username TEXT, password TEXT, description TEXT , site varchar (50))", cb);
}

function close() {

}

function updateserver(server, cb) {    
    this.db.run("UPDATE server SET address=?, port=?, username=?, password=?, description=?, site=? WHERE id=?",
	     [server.address, server.port, server.username, server.password, server.description, server.site, server.id], cb);    
}

function deleteserver(serverId, cb) {
    this.db.run("DELETE FROM server WHERE id=?", [serverId], cb);
}

function addserver(server, cb) {
    this.db.run("INSERT INTO server(id, address, port, username, password, description, site) VALUES(?, ?, ?, ?, ?, ?, ?)",
	       [server.id, server.address, server.port, server.username, server.password, server.description, server.site],
	       function (err) {
        if (!err)
            server.id = this.lastID;
        
        cb(err);
    });
}

function getserver(id, cb) {
    this.db.get("SELECT id, address, port, username, password, description, site FROM server WHERE id=?", id, cb);
}

function getservers(cb) {
    this.db.all("SELECT id, address, port, username, password, description, site FROM server", cb);
}


function serverPersistence(db) {
    if (!this) return new serverPersistence(dbFileName);
    this.db = db;
}

serverPersistence.prototype.open = open;
serverPersistence.prototype.close = close;

serverPersistence.prototype.getserver = getserver;
serverPersistence.prototype.getservers = getservers;

serverPersistence.prototype.addserver = addserver;
serverPersistence.prototype.updateserver = updateserver;
serverPersistence.prototype.deleteserver = deleteserver;

module.exports = serverPersistence;
