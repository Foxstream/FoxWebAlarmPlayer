var events = require('events');
var _ = require('lodash');
var async = require("async");
var util = require('util');

var FoxXmlClient = require('./FoxXmlClient.js');
var FoxXmlAlarmClient = require('./FoxXmlAlarmClient.js');

//send events:
//-connected (srv.config)
//-connectionLost (srv.config, reason)
//-alarm (alarmData)
//-alarmImages (alarmData)
//-analysisState (config, state)

function RequestServerConnect(srv) {
    var self = this;

    srv.xmlclient.on("connected", function() {
        if (!srv.config.connected) {
            srv.config.connected = true;
            self.emit('connectionEstablished', srv.config);
        }
        if (srv.config.firstConnectionAttempt) {
            srv.config.firstConnectionAttempt = false;
        }
    });

    srv.xmlclient.on("connectionLost", function(reason) {
        if (srv.config.connected && !srv.config.disconnectOnUpdate) {
            srv.config.connected = false;
            self.emit('connectionLost', srv.config);
        } else if (srv.config.firstConnectionAttempt) {
            self.emit('connectionLost', srv.config);
            srv.config.firstConnectionAttempt = false;
        }
    });

    srv.xmlclient.on("analysisState", function(newState) {
        if (newState != null)
            self.emit('analysisState', { server: srv.config, state: newState });
    });

    srv.xmlclient.on("alarm", function(alarmData) {
        if (alarmData.activation == 'on') {
            var cam = _.find(alarmData.server.Configuration.cameras, function(cam) { return cam.id == alarmData.camid; })

            alarmObj = {
                timestamp: alarmData.timestamp,
                cameraname: cam.name,
                hostname: srv.xmlclient.Configuration.equipment.name,
                sitename: srv.xmlclient.Configuration.equipment.site,
                handled: 0
            };

            self.alarmPersistence.saveAlarm(alarmObj, function(err, obj) {
                alarmData.dbobject = obj;
                self.emit('alarm', obj);
            });
        }
    });

    srv.alarmclient.on("alarmimages", function(data) {
        if (data && data.dbobject) {
            data.dbobject.images = data.images;

            self.alarmPersistence.saveAlarm(data.dbobject, function(err, obj) {
                self.emit('alarm_update', obj);
            });
        }
    });

    srv.config.connected = false;
    srv.xmlclient.connect();

}

function InternalDisconnectServer(server) {
    server.xmlclient.removeAllListeners();
    server.xmlclient.disconnect();
}

function BuildInternalServer(srv) {

    var xmlclient = new FoxXmlClient(srv.address, srv.port, srv.username, srv.password);
    var alarmclient = new FoxXmlAlarmClient(xmlclient);
    return { config: srv, alarmclient: alarmclient, xmlclient: xmlclient };
}

function AddAndRequestConnect(s) {
    var srvElement = BuildInternalServer(s);

    this.servers.push(srvElement);

    RequestServerConnect.bind(this)(srvElement);
}

function UpdateServer(server, cb) {
    var self = this;
    var retServers = this.servers.map(function(elem) { return elem.config; });
    var pos = retServers.map(function(elem) { return elem.id; }).indexOf(parseInt(server.id));
    if (pos == -1) {
        console.log('not found')
        cb("Not found");
    } else {
        this.serverPersistence.updateserver(server, function(err, data) {
            if (err) {
                cb(err);
            } else {
                self.servers[pos].config.disconnectOnUpdate = true; // Prevents from sending disconnect notification to client
                InternalDisconnectServer(self.servers[pos]);
                server.firstConnectionAttempt = true;
                self.servers[pos] = BuildInternalServer(server);

                RequestServerConnect.bind(self)(self.servers[pos]);
                cb(null, data);
            }
        });
    }
}


function AddServer(server, cb) {
    var self = this;

    this.serverPersistence.addserver(server, function(err, s) {
        if (!err) {
            server.firstConnectionAttempt = true; // Will notify clients if server is not reachable
            AddAndRequestConnect.bind(self)(server);
        }

        cb(err, s);
    });
}

function RemoveServer(serverId, cb) {
    var self = this;

    var retServers = this.servers.map(function(elem) { return elem.config; });
    var pos = retServers.map(function(elem) { return elem.id; }).indexOf(parseInt(serverId));
    if (pos == -1)
        cb("Not found");
    else
        this.serverPersistence.deleteserver(serverId, function(err) {
            InternalDisconnectServer(self.servers[pos]);
            self.servers.splice(pos, 1);

            cb(err);
        })
}

function extractServerDataToSend(srv) {
    var cloned = JSON.parse(JSON.stringify(srv.config));
    return cloned;
}

function GetServer(serverId, cb) {
    var retServers = this.servers.map(extractServerDataToSend);
    var pos = retServers.map(function(elem) { return elem.id; }).indexOf(parseInt(serverId));
    cb(pos != -1 ? null : "Not found", pos != -1 ? retServers[pos] : null);
}

function GetServers(cb) {
    var retServers = this.servers.map(extractServerDataToSend);
    cb(null, retServers);
}

function Start() {
    var self = this;
    this.serverPersistence.getservers(function(err, data) {
        if (!err) {
            _.each(data, AddAndRequestConnect.bind(self));
        }
    })
}

function Stop() {
    _.forEach(this.servers, function(srv) {
        InternalDisconnectServer(srv);
    })

    this.servers = [];
}

function EnableAnalysis(bState) {
    _.forEach(this.servers, function(srv) {
        srv.xmlclient.enableAnalysis(bState);
    })
}

function ServersManager(serverPersistence, alarmPersistence) {
    if (!this) return new ServersManager(serverPersistence);

    events.EventEmitter.call(this);

    this.serverPersistence = serverPersistence;
    this.alarmPersistence = alarmPersistence;
    this.servers = [];
    //.config -> data from database
    //.alarmclient -> FoxXmlAlarmClient
    //.xmlclient -> FoxXmlClient
}

util.inherits(ServersManager, events.EventEmitter);

ServersManager.prototype.addserver = AddServer;
ServersManager.prototype.removeserver = RemoveServer;
ServersManager.prototype.updateserver = UpdateServer;
ServersManager.prototype.getserver = GetServer;
ServersManager.prototype.getservers = GetServers;
ServersManager.prototype.enableanalysis = EnableAnalysis;

ServersManager.prototype.start = Start;
ServersManager.prototype.stop = Stop;


module.exports = ServersManager;