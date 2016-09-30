var auth = require("../Authenticator.js");
var util = require('util');
var events = require('events');

function applyApp(app){

	var self=this;


    app.get('/alarms', auth.IsValidUser, function(req, res){
        var conditions = req.query;
        self.AlarmPersistence.getAlarms(conditions, function(err, data){
            if (err){
                res.status(500);
                res.send(err);
            } else {
                res.status(200);
                res.json(data);
            }
        });
    });

    app.get('/alarms/sitelist', auth.IsValidUser, function(req, res){
        res.status(200);
        res.send(self.AlarmPersistence.getSiteList());
    });

    app.get('/alarms/cameralist', auth.IsValidUser, function(req, res){
        res.status(200);
        res.send(self.AlarmPersistence.getCameraList());
    });

    app.get('/alarms/:alarmid', auth.IsValidUser, function(req, res){     
        self.AlarmPersistence.getAlarm(req.params.alarmid, function(err, data){
            if(err){
                res.status(500);
                res.send(err);
            }
            else {
                if (data){
                    res.status(200);
                    res.json(data);
                } else {
                    res.status(204);
                    res.end();
                }
            }
        });
    });


    app.put('/alarms/:alarmid/handled', auth.IsValidUser, function (req, res) {
        self.AlarmPersistence.getAlarm(req.params.alarmid, function (err, data) {
            if (data){
                data.handled = 1;
                self.AlarmPersistence.saveAlarm(data, function (err, data) {
                    if (!err) {
                        res.json(data);
                        res.end();

                        self.emit('alarm_handled', data);
                    }
                    else {
                        res.status(404);
                        res.end(err);
                    }                    
                });                
            }                
            else {
                res.status(404);
                res.end(err);
            }
        });
    });

	app.get('/alarms/:alarmid/image/:imgid', auth.IsValidUser, function(req, res){		
		res.redirect('/alarms/'+req.params.alarmid+'/image/'+req.params.imgid+'/jpg');
	});
	
	app.get('/alarms/:alarmid/image/:imgid/jpg', auth.IsValidUser, function(req, res){			
        self.AlarmPersistence.getStreamAlarmImage(req.params.alarmid, req.params.imgid, false, function (err, stream) {
            if (err) {
                res.status(404);
                res.json(err);
            }
            else {
                stream.on('error', function (err) { });//ignore errors
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                stream.pipe(res);
            }
        });	
	})
	
	app.get('/alarms/:alarmid/image/:imgid/osd', auth.IsValidUser, function(req, res){				
        self.AlarmPersistence.getStreamAlarmImage(req.params.alarmid, req.params.imgid, true, function (err, stream) {
            if (err) {
                res.status(404);
                res.json(err);
            }
            else {
                stream.on('error', function (err) { });//ignore errors
                res.writeHead(200, { 'Content-Type': 'application/json' });
                stream.pipe(res);
            }
        });	
        
    });

}



function AlarmController(alarmPersistence)
{
	if(!this)return new AlarmController(alarmPersistence);
	
	this.AlarmPersistence=alarmPersistence;
}

util.inherits(AlarmController, events.EventEmitter);

AlarmController.prototype.ApplyAlarmRoutes=applyApp;

module.exports=AlarmController;