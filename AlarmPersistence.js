var mkdirp = require('mkdirp');
var path = require('path');
var _ = require("lodash");
var fs = require('fs');
var async = require("async")
var rimraf = require("rimraf")

var imgDirname='images';
var imgDefaultFilename='img';

function open(callback)
{	
	this.db.run("CREATE TABLE IF NOT EXISTS alarm (id INTEGER PRIMARY KEY, timestamp INTEGER, cameraname TEXT, hostname TEXT, sitename TEXT, handled INTEGER, nbimages INTEGER)", callback);
}

function close()
{	
}

//return an object which can be used to update the database
function getDbObject(inputObj)
{
	var nbimages=inputObj.images ? inputObj.images.length : (inputObj.nbimages?inputObj.nbimages:0);
		
	return {
		$id:		 inputObj.id, 
		$timestamp:  inputObj.timestamp, 
		$cameraname: inputObj.cameraname, 
		$hostname:   inputObj.hostname, 
        $sitename:   inputObj.sitename,
        $handled:    inputObj.handled,
		$nbimages:   nbimages	
	}
}

//strip the $ from all the properties of the object
function stripDollars(obj)
{
	ret={};
	_.forEach(obj, function(val, key)
	{
		if(key[0]=='$')
			ret[key.substr(1)]=val;
		else
			ret[key]=val;
	});
	
	return ret;
}

function buildFolderName(obj, alarmId)
{
    return obj.ImageFolder + path.sep + imgDirname + path.sep + alarmId;
}

function buildPathName(obj, alarmId, imageIdx)
{
    return buildFolderName(obj, alarmId) + path.sep + imgDefaultFilename + imageIdx;
}

function extractOsdDataFromBinary(buffer)
{
	if(buffer.length<4)return [];
	
	var objList=[];
	var obj=[];
		
	buffer.readInt32LE(0);
	var pos=4;
	while(pos<=buffer.length-8)
	{
		var x=buffer.readInt32LE(pos);pos+=4;
		var y=buffer.readInt32LE(pos);pos+=4;
		
		if(x==-1 || y==-1)
		{
			objList.push(obj);
			obj=[];
		}
		else
			obj.push({'x':x, 'y':y});
	}
	
	if(obj.length>0)
		objList.push(obj);
	
	return JSON.stringify(objList);
}

function saveImageAndOsd(rootFilname, image, osd, callback)
{
	async.parallel([
		function(cb){
			fs.writeFile(rootFilname+".jpg", image, {encoding:"base64"},cb);
		},
		function(cb){			
			fs.writeFile(rootFilname+".osd", extractOsdDataFromBinary(new Buffer(osd.$text, "base64")), cb);
		}],
		callback);
}

function saveImages(alarm, callback)
{
    var folder = buildFolderName(this, alarm.id);
    var self = this;

	mkdirp(folder, function(err) { 
		if(!err)
		{
			async.each(alarm.images, function(file, mycallback) {
				
				var index=alarm.images.indexOf(file);				
				saveImageAndOsd(buildPathName(self, alarm.id, index), file.image, file.osd, mycallback);		
				
			}, callback);
		}
		else
			callback(err);

	});
}

function insertAlarm(alarm, callback)
{	
	var dbobj = getDbObject(alarm);
	
	this.db.run("INSERT INTO alarm(timestamp, cameraname, hostname, sitename, handled, nbimages) VALUES($timestamp, $cameraname, $hostname, $sitename, $handled, $nbimages)",
	dbobj, 
	function(err)
	{
		if(!err)
		{
			dbobj.id=this.lastID;			
			callback(null, stripDollars(dbobj));
		}
		else
			callback(err, null);
		
	});
}

function updateAlarm(alarm, callback)
{
	var dbobj = getDbObject(alarm);
	
	this.db.run("UPDATE alarm SET timestamp=$timestamp, cameraname=$cameraname, hostname=$hostname, sitename=$sitename, handled=$handled, nbimages=$nbimages WHERE id=$id", 
	dbobj, 
	function(err){		
		callback(err, err ? null : stripDollars(dbobj));
	});
}

function saveAlarm(alarm, callback)
{			
	var nbimages=alarm.images?1:0;
	var self=this;
	
	var insertCb=function(err, obj)
	{
		if(err)
			callback(err, null)
		else
			saveImages.call(self, alarm, function(e){
				callback(e, e?null:obj);
			});
	};
	
	if(!alarm.id)	
		insertAlarm.call(this,alarm, alarm.images ? insertCb : callback);	
	else
		updateAlarm.call(this,alarm, alarm.images ? insertCb : callback);		
}

function getStreamAlarmImage(id, imageidx, bOsd)
{	
	return fs.createReadStream(buildPathName(this, id, imageidx) + (bOsd?".osd":".jpg") );
}

function getAlarms(conditions, callback)
{
    var str = " WHERE 1==1 ";
    var cond = {};
    if (conditions)
        _.forEach(conditions, function (val, key) {
            str += "AND " + key + "==$" + key
            cond['$' + key] = val;
        });

	this.db.all("SELECT id, timestamp, cameraname, hostname, sitename, handled, nbimages FROM alarm" + str, cond, callback);
}

function getAlarm(id, callback)
{
	this.db.get("SELECT id, timestamp, cameraname, hostname, sitename, handled, nbimages FROM alarm WHERE id=$id", {$id:id}, callback);
}

function deleteAlarm(id, callback){
	this.db.run("DELETE FROM alarm WHERE id=$id", {$id:id}, callback);
}


function deleteAlarmsOlderThan(timestamp, cb)
{
    var self = this;
    this.db.all("SELECT id, timestamp, cameraname, hostname, sitename, handled, nbimages FROM alarm WHERE timestamp<$timestamp", { $timestamp: timestamp }, function (err, data) { 
        if (err) cb(err);
        self.db.run("DELETE FROM alarm WHERE timestamp<$timestamp", { $timestamp: timestamp }, function (err) {            
            var folderlist = [];
            for (var i = 0; i < data.length; ++i) 
                folderlist.push(buildFolderName(self, data[i].id));                          
            
            async.each(folderlist, rimraf, function () { cb(err); });
            
        });

    });
}

function AlarmPersistence(db, imageFolder)
{
	if(!this)return new AlarmPersistence(db, imageFolder);
    this.db = db;
    this.ImageFolder = imageFolder;
}

AlarmPersistence.prototype.open = open;
AlarmPersistence.prototype.close = close;

AlarmPersistence.prototype.saveAlarm = saveAlarm;
AlarmPersistence.prototype.getAlarms = getAlarms;
AlarmPersistence.prototype.getAlarm = getAlarm;
AlarmPersistence.prototype.deleteAlarmsOlderThan = deleteAlarmsOlderThan;
AlarmPersistence.prototype.deleteAlarm = deleteAlarm;

AlarmPersistence.prototype.getStreamAlarmImage = getStreamAlarmImage;

module.exports=AlarmPersistence;
