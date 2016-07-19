var FoxXml = require('./FoxXmlClient.js');
var FoxXmlAlarmClient = require('./FoxXmlAlarmClient.js');
var WebServer = require('./WebServer.js');
var ServerSideEvent = require('./ServerSideEvent.js');
var AlarmPersistence = require('./AlarmPersistence.js');
var UserPersistence = require('./UserPersistance.js');
var ServerPersistence = require('./ServerPersistance.js');
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

var _ = require("lodash");
var async = require("async");

var websrv = WebServer.BuildWebServer();
var db = new sqlite3.Database(config.get('dbHost'), sqlite3.OPEN_READWRITE, function(err){
    if (err){
        console.error('\nDatabase connection error :');
        console.error(err);
        process.exit(1);
    }
});

var almPers = new AlarmPersistence(db, "data");
var userPers = new UserPersistence(db);
var serverPers = new ServerPersistence(db);
var almControler = new AlarmController(almPers);
var userControler = new UserController(userPers);
var serverManager = new ServersManager(serverPers, almPers);
var serverControler = new ServerController(serverManager);
var liveController = new LiveController(serverManager);
var alarmRemover = new AlarmRemover(almPers, 60*60*24*7); // 7 days

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
        console.log('Sending connection message to client for server', srv.address);
        sse.sendMessage('connection', JSON.stringify(srv)); 
    });

    serverManager.on("connectionEstablished", function (srv) { 
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
    console.log('\n\nServer listening on port ' + port + '\n\n');

    // Used for testing
    module.exports = websrv; 

});



