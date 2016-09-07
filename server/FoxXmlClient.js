var util = require('util');
var XmlClient = require('./XmlClient.js');
var events = require('events');
var _ = require("lodash");
var log = require("./logger");

//events sent: connected, connectionLost, configReceived, alarm, alarmImages, 

function schedulePeriodicTest()
{
	this.CallbackTimer = setTimeout(periodic_test.bind(this), 10000);
}

function handleAuthResponse(err, data)
{				
	if(!err)
	{	
		this.ConnectionEstablished=true;
		this.emit('connected');
		
		if(this.AutoRequestConfig)
			getConfig.call(this);
	}
	else
	{
		this.emit('connectionLost', 'authentication error');
	}
}

function getConfig()
{
	var self=this;	
	
	this.client.send({"$":{type:"config"}}, function(err, data)
	{
		if(data && data.equipment)
		{
			self.Configuration = 
			{
				equipment:
				{
					id : data.equipment.$.eqid,
					name : data.equipment.$.name,
					site : data.equipment.$.site,
					addr : data.equipment.$.addr1 +' '+ data.equipment.$.addr2,
					city : data.equipment.$.city,
					zipcode : data.equipment.$.zipcode,
					country : data.equipment.$.country
				},
				cameras:_.map(data.camera?data.camera:[], function(cam)
				{
					return {
						name: cam.$.name,
						id : cam.$.camid,
						buffer:
							{
								before:cam.buffer.$.before,
								after:cam.buffer.$.after,
								interval:cam.buffer.$.interval
							}
						
						};
				})
			};
			self.emit('configReceived', self.Configuration);
		}
		else {
			log.error("Invalid config received");
		}
	});		
}

function connectClient()
{
	var self=this;
	
	this.client.setNodeAsArray("camera");
	this.client.setNodeAsArray("image");
	
	this.client.connect(function(){		
		self.client.send({"$":{type:"auth", user:self.User, pass:self.Pass, appli:"NodeServer"}},
			handleAuthResponse.bind(self));		
	});
}

function connect(){
	var self=this;
	connectClient.call(this);
	schedulePeriodicTest.call(this);
	
	this.client.on('disconnected', function(err){ self.ConnectionEstablished=false; self.emit('connectionLost', err);});
	this.client.on('unexpectedData', gotUnexpectedMessage.bind(this));
}

function gotUnexpectedMessage(data)
{
	if(data.$.type=='alarm')
	{
		var self=this;
		var alarm={camid:data.$.camid,
			       server:self,
				   timestamp:data.$.timestamp,
				   type:data.$.subtype,
				   activation:data.$.mode
				   };
				   				   		
		log.info('Alarm received from '+this.client.Host+':'+this.client.Port);
		
		this.emit('alarm',alarm);
	}
	else if(data.$.type=='alarm')
	{
		var self=this;
		this.client.disconnect();
		this.ConnectionEstablished=false; 
		this.emit('connectionLost','Bye received');
		
		log.info('Bye received from '+this.client.Host+':'+this.client.Port);
	}
}

function disconnect()
{
    clearTimeout(this.CallbackTimer);
    this.CallbackTimer = undefined;
	this.client.disconnect();
}

function periodic_test()
{	
	if(this.ConnectionEstablished) //send ping
	{		
		this.client.send({"$":{type:"ping"}},function(){});
	}
	else//reconnect
	{
		connectClient.call(this);
	}
	
	schedulePeriodicTest.call(this);
}

function send(message, responseCallback)
{
	return this.client.send(message, responseCallback);
}

function FoxXmlClient(address, port, user, password)
{
	if(!this)return new FoxXmlClient(address, port, user, password);

	events.EventEmitter.call(this);
	
	this.client = new XmlClient(address, port, user, password);	
	this.User = user;
	this.Pass = password;
	
	this.ReconnectInterval=30;	
	this.AutoRequestConfig = true;
	this.ConnectionEstablished = false;
	
}

util.inherits(FoxXmlClient, events.EventEmitter);

FoxXmlClient.prototype.connect = connect;
FoxXmlClient.prototype.send = send;
FoxXmlClient.prototype.disconnect = disconnect;

module.exports=FoxXmlClient;