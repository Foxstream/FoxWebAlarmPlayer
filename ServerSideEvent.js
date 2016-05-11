var auth = require("./Authenticator.js");

function sendMessage(type, content)
{	
	var self=this;
	
    this.Connections.forEach(function(con) {        
        con.write('id: ' + self.MsgId + '\n');
        con.write('event: '+ type + '\n');
        con.write('data:' + content + '\n\n'); // extra newline
    });
    
    ++self.MsgId;
}

function ServerSideEvent(app, url)
{
	if (!this) return new ServerSideEvent(app, url);
	
	this.Connections=[];
	this.MsgId= 0;
	
	var self=this;	
	
	app.get(url, auth.IsValidUser, function(req, res) {
 		
		//req.socket.setTimeout(Infinity);//already default value
	 
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});
		res.write('\n');
	 	
		self.Connections.push(res);	 
		req.on("close", function() {
			self.Connections.splice(self.Connections.indexOf(res), 1);		
		});
	});
	
}

ServerSideEvent.prototype.sendMessage = sendMessage;


module.exports=ServerSideEvent;
