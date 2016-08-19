var events = require('events');
var _ = require("lodash");
var util = require('util');
var log = require('./logger');

//emit alarmimages(data)

function scheduleRequestAlarmInfo(alarmInfo)
{
	if(alarmInfo.activation!='on') return;
		
	if(this.foxxmlclient.Configuration)	
	{
		var cam = _.find(this.foxxmlclient.Configuration.cameras, function(cam){return cam.id==alarmInfo.camid;})
		
		if(cam){
			setTimeout(getAlarm.bind(this,alarmInfo), 1000+(cam.buffer.after*cam.buffer.interval));
		}
		else {
			log.warn("Alarm received for undefined camera");
		}
	}
	else {
		log.warn("Unable to get alarm without getting the configuration first");
	}
}

function getAlarm(alarmInfo)
{
	var self=this;
	this.foxxmlclient.send({"$": {
			type: "getalarm", 
			timestamp: alarmInfo.timestamp, 
			camid: alarmInfo.camid, 
			subtype: alarmInfo.type,
			mode: "bulk"
		}}, function(err, data)
	{
		if(err)
			log.error('Unable to get alam : ' + err);
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
			log.info("Got alarm images " + alarmInfo.images.length);
		}
	});
}


function FoxXmlAlarmClient(foxxmlclient)
{
	if(!this)return new FoxXmlAlarmClient(foxxmlclient);

	events.EventEmitter.call(this);
	
	this.foxxmlclient = foxxmlclient;
	
	foxxmlclient.on('alarm',scheduleRequestAlarmInfo.bind(this));
}

util.inherits(FoxXmlAlarmClient, events.EventEmitter);

module.exports=FoxXmlAlarmClient;
