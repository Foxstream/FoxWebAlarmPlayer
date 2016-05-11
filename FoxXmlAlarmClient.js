var events = require('events');
var _ = require("lodash");
var sys = require('sys');

//emit alarmimages(data)

function scheduleRequestAlarmInfo(alarmInfo)
{
	if(alarmInfo.activation!='on') return;
		
	if(this.foxxmlclient.Configuration)	
	{
		var cam=_.find(this.foxxmlclient.Configuration.cameras, function(cam){return cam.id==alarmInfo.camid;})
		
		if(cam)
			setTimeout(getAlarm.bind(this,alarmInfo), 1000+(cam.buffer.after*cam.buffer.interval));	
		else
			console.log("Alarm received for undefined camera");
	}
	else
		console.log("Unable to get alarm without getting the configuration first");
}

function getAlarm(alarmInfo)
{
	var self=this;
	this.foxxmlclient.send({"$":{type:"getalarm", timestamp:alarmInfo.timestamp, camid:alarmInfo.camid, subtype:alarmInfo.type, mode:"bulk"}}, function(err, data)
	{
		if(err)
			console.log('Unable to get alarm for alarm, reason '+err);
		else
		{			
			alarmInfo.images=_.map(data.image, function(img){
				return {
					timestamp : img.$.timestamp,
					image     : img.data,
					osd       : img.osd
				};
			});
			
			self.emit('alarmimages', alarmInfo);
			console.log("Got alarm images "+alarmInfo.images.length);
		}
	});
}


function FoxXmlAlarmClient(foxxmlclient)
{
	if(!this)return new FoxXmlAlarmClient(foxxmlclient);

	events.EventEmitter.call(this);
	
	this.foxxmlclient=foxxmlclient;
	
	foxxmlclient.on('alarm',scheduleRequestAlarmInfo.bind(this));
}

sys.inherits(FoxXmlAlarmClient, events.EventEmitter);

module.exports=FoxXmlAlarmClient;
