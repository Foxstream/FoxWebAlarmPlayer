var auth = require("../Authenticator.js");
var sys = require('sys');
var events = require('events');


function applyApp(app)
{
	var self=this;
	app.get('/controller/alarms', auth.IsValidUser, function(req, res){
		self.AlarmPersistence.getAlarms(null, function(err, data){			
			if(data)
				res.json(data);
			else
			{
				res.status(402);
				res.send(err);
			}
			res.end();
				
		});
    });
    
    app.get('/controller/alarms/handled', auth.IsValidUser, function (req, res) {
        self.AlarmPersistence.getAlarms({handled:0}, function (err, data) {
            if (data)
                res.json(data);
            else {
                res.status(402);
                res.send(err);
            }
            res.end();
				
        });
    });
	
	app.get('/controller/alarm/:alarmid', auth.IsValidUser, function(req, res){		
		self.AlarmPersistence.getAlarm(req.params.alarmid, function(err, data){
			
			if(data)
				res.json(data);
			else
			{
				res.status(402);
				res.send(err);
			}
			res.end();
				
		});
    });
       
	app.get('/controller/alarm/:alarmid/image/:imgid', auth.IsValidUser, function(req, res){		
		res.redirect('/controller/alarm/'+req.params.alarmid+'/images/'+req.params.imgid+'/jpg');
	});
	
	app.get('/controller/alarm/:alarmid/image/:imgid/jpg', auth.IsValidUser, function(req, res){			
		var stream = self.AlarmPersistence.getStreamAlarmImage(req.params.alarmid, req.params.imgid);		
		stream.on('error',function(){res.end()});
		res.writeHead(200, {'Content-Type': 'image/jpeg'});	
		stream.pipe(res);		
	});
	
	app.get('/controller/alarm/:alarmid/image/:imgid/osd', auth.IsValidUser, function(req, res){				
		var stream = self.AlarmPersistence.getStreamAlarmImage(req.params.alarmid, req.params.imgid, true);	
		stream.on('error',function(){res.end()});
		res.writeHead(200, {'Content-Type': 'application/json'});			
		stream.pipe(res);		
    });

    app.put('/controller/alarm/:alarmid/markashandled', auth.IsValidUser, function (req, res) {
        self.AlarmPersistence.getAlarm(req.params.alarmid, function (err, data) {
            if (data) {
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


    app.delete('/controller/alarm/:alarmid', auth.IsValidUser, function(req, res){
        self.AlarmPersistence.deleteAlarm(req.params.alarmid, function(err){
            if (err){
                console.log(err)
                res.status(404);
                res.end(JSON.stringify(err));  
            } else {
                res.status(200);
                res.end('alarm deleted');

                self.emit('alarm_deleted', req.params.alarmid);
            }
        });
    });

}

function AlarmController(alarmPersistence)
{
	if(!this)return new AlarmController(alarmPersistence);
	
	this.AlarmPersistence=alarmPersistence;
}

sys.inherits(AlarmController, events.EventEmitter);

AlarmController.prototype.ApplyAlarmRoutes=applyApp;


module.exports=AlarmController;
