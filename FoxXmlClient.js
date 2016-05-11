var sys = require('sys');
var XmlClient=require('./XmlClient.js');
var events = require('events');
var _ = require("lodash");

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
		console.log('Authentication error while connecting with '+self.Client.Host+':'+self.Client.Port);
		this.emit('connectionLost', 'authentication error');
	}
}

function getConfig()
{
	var self=this;	
	
	this.Client.send({"$":{type:"config"}}, function(err, data)
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
		else
			console.log("Invalid config received");
	});		
}

function connectClient()
{
	var self=this;
	
	this.Client.setNodeAsArray("camera");
	this.Client.setNodeAsArray("image");
	
	this.Client.connect(function(){		
		self.Client.send({"$":{type:"auth", user:self.User, pass:self.Pass, appli:"NodeServer"}},
			handleAuthResponse.bind(self));		
	});
}

function connect()
{	
	var self=this;
	connectClient.call(this);
	schedulePeriodicTest.call(this);
	
	this.Client.on('disconnected', function(err){self.ConnectionEstablished=false; self.emit('connectionLost', err);});
	this.Client.on('unexpectedData', gotUnexpectedMessage.bind(this));
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
				   				   		
		console.log('Alarm received from '+this.Client.Host+':'+this.Client.Port);
		
		this.emit('alarm',alarm);
	}
}

function disconnect()
{
    clearTimeout(this.CallbackTimer);
    this.CallbackTimer = undefined;
	this.Client.disconnect();	
}

function periodic_test()
{	
	if(this.ConnectionEstablished)//send ping
	{		
		this.Client.send({"$":{type:"ping"}},function(){});
	}
	else//reconnect
	{
		connectClient.call(this);
	}
	
	schedulePeriodicTest.call(this);
}

function send(message, responseCallback)
{
	return this.Client.send(message, responseCallback);
}

function FoxXmlClient(address, port, user, password)
{
	if(!this)return new FoxXmlClient(address, port, user, password);

	events.EventEmitter.call(this);
	
	this.Client = new XmlClient(address, port, user, password);	
	this.User = user;
	this.Pass = password;
	
	this.ReconnectInterval=30;	
	this.AutoRequestConfig=true;
	this.ConnectionEstablished=false;
	
}

sys.inherits(FoxXmlClient, events.EventEmitter);

FoxXmlClient.prototype.connect = connect;
FoxXmlClient.prototype.send = send;
FoxXmlClient.prototype.disconnect = disconnect;



module.exports=FoxXmlClient;
