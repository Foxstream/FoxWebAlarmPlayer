var FoxXml = require('./FoxXmlClient.js');
var FoxXmlAlarmClient = require('./FoxXmlAlarmClient.js');
var WebServer = require('./WebServer.js');
var ServerSideEvent = require('./ServerSideEvent.js');
var AlarmPersistence = require('./persistence/AlarmPersistence.js');
var UserPersistence = require('./persistence/UserPersistence.js');
var ServerPersistence = require('./persistence/ServerPersistence.js');
var AlarmController = require('./controller/AlarmController.js');
var UserController = require('./controller/UserController.js');
var ServerController = require('./controller/ServerController.js');
var LiveController = require('./controller/LiveController.js');
var AccountSettingsController = require('./controller/AccountSettingsController.js');
var ServersManager = require('./ServersManager.js');
var Auth = require('./Authenticator.js');
var sqlite3 = require('sqlite3').verbose();
var AlarmRemover = require('./AlarmRemover.js');
var fs = require('fs');

var config = require('config');

var log = require('./logger');

var _ = require("lodash");
var async = require("async");

log.info('Building web server')
var websrv = WebServer.BuildWebServer();

log.debug('Used database : ' + config.get('dbHost'));

var db = new sqlite3.Database(config.get('dbHost'));

var almPers = new AlarmPersistence(db, "server/data");
var userPers = new UserPersistence(db);
var serverPers = new ServerPersistence(db);
var almControler = new AlarmController(almPers);
var userControler = new UserController(userPers);
var serverManager = new ServersManager(serverPers, almPers);
var serverControler = new ServerController(serverManager);
var liveController = new LiveController(serverManager);
var alarmRemover = new AlarmRemover(almPers, config.get('deleteAlarmsOlderThanSeconds'));

log.info('Applying routes.');
Auth.ApplyToServer(websrv, userPers);
WebServer.ApplyMainRoutes(websrv);
almControler.ApplyAlarmRoutes(websrv);
userControler.ApplyUserRoutes(websrv);
serverControler.ApplyServerRoutes(websrv);
liveController.ApplyLiveRoutes(websrv);
AccountSettingsController(websrv, userPers);

var sse = new ServerSideEvent(websrv, "/events");

async.parallel([almPers.open.bind(almPers), userPers.open.bind(userPers), serverPers.open.bind(serverPers)], function (err) {
    
    serverManager.on("connectionLost", function (srv){ 
        log.info('Sending connection message to client for server', srv.address);
        sse.sendMessage('connection', JSON.stringify(srv)); 
    });

    serverManager.on("connectionEstablished", function (srv) { 
        log.info('Sending connection message to client for server', srv.address);
        sse.sendMessage('connection', JSON.stringify(srv));
    });
    
    serverManager.on("alarm", function (alarm) { sse.sendMessage('alarm_create', JSON.stringify(alarm)); });
    serverManager.on("alarm_update", function (alarm) { sse.sendMessage('alarm_update', JSON.stringify(alarm)); });

    serverManager.start();
    
    alarmRemover.start();
    
    almControler.on("alarm_handled", function (alarm){ sse.sendMessage('alarm_update', JSON.stringify(alarm)); });
    almControler.on("all_alarms_handled", function(alarm){ sse.sendMessage('all_alarms_handled') });
    almControler.on("alarm_deleted", function (alarmId){ sse.sendMessage('alarm_deleted', alarmId) });

    var port = config.get('port');
    websrv.listen(port);
    log.info('Server listening on port ' + port + '\n');

});

// Export for testing
module.exports = websrv;