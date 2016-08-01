var net = require('net');
var XmlStream = require('xml-stream'); //use npm config set python /path/to/executable/python2.7 to install if needed
var xml2js = require('xml2js');
var through=require("through");
var events = require('events');
var util = require("util");
var _ = require("lodash");
var log = require('./logger')('./alarmplayer.log', 0);

//events: unexpectedData, disconnected
function connect(successCallback)
{		
	var self = this;
	
	log.info("Conecting with " + this.Host);
	
	if(this.client)
		return;
				
	this.client = net.connect({host:this.Host, port: this.Port},
    	function() { 
		
		self.connected = true;
		log.info('Connected with '+self.Host);
		
		var first = true;
		self.xml=new XmlStream(self.client.pipe(through(function(data){//prepend at the very begining root element; move as own function
				if(first)this.queue("<root>");
				first=false;
				this.queue(data);
			})), 'utf8');	
						
		_.forEach(self.CollectedItems, self.xml.collect.bind(self.xml));				
			
		self.xml.on("endElement: fox", receivingData.bind(self));
		
		successCallback();				
	});	
	
	this.client.on("end",connectionLost.bind(this));
	this.client.on("error",connectionLost.bind(this));
		
}

function receivingData(data)
{	
	log.info("Got data from "+this.Host+" of type "+data.$.type);
	
	if(data.$.id && this.Callbacks[parseInt(data.$.id)])
	{
		if(data.$.type=="error")			
			this.Callbacks[parseInt(data.$.id)](data.$text, null);
		else
			this.Callbacks[parseInt(data.$.id)](null, data);
			
		delete this.Callbacks[parseInt(data.$.id)];
	}
	else if(data.$.query=="none"){
		this.emit("unexpectedData", data);
	}
	else {
		log.error("Error : message not requested "+JSON.stringify(data));
	}
}

function connectionLost()
{		
	this.connected = false;
	log.warn("Disconnected from " + this.Host);	
	this.emit("disconnected", "disconnected from host");
	this.client=null;
}

function internal_send(message, responseCallback)
{	
	this.Callbacks[this.MessageId]=responseCallback;
	message.$.id=this.MessageId++;
		
	var builder = new xml2js.Builder({rootName:"fox", headless : true});
	var xml = builder.buildObject(message);
	
	log.info("Sending message "+message.$.type+" to "+this.Host );
	
	this.client.write(xml);
}

function disconnect()
{
    if (this.client) {
        this.client.end();
        this.client = null;
    }
}

//two parameters in callback - first error, second data
function send(message, responseCallback)
{
	if (!this.connected)
		return responseCallback("Not connected", null);
	
	internal_send.bind(this)(message, responseCallback);
}

function setNodeAsArray(elem)
{
	if (_.indexOf(this.CollectedItems,elem) === -1)
	{				
		if(this.xml)this.xml.collect(elem);
		
		this.CollectedItems.push(elem);
	}
}

function XmlClient(address, port)
{
	if(!this)return new FoxXmlClient(address,port);

	events.EventEmitter.call(this);
 
	this.Host = address;
	this.Port = port;
	
	this.MessageId = 1;
	this.Callbacks={};
	
	this.CollectedItems=[];
}

util.inherits(XmlClient, events.EventEmitter);

XmlClient.prototype.connect = connect;
XmlClient.prototype.disconnect = disconnect;
XmlClient.prototype.send = send;

XmlClient.prototype.setNodeAsArray = setNodeAsArray;


module.exports=XmlClient;