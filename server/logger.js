/** LOG LEVELS
    1. INFO
    2. DEBUG
    3. WARNING
    4. ERROR
**/

var fs = require('fs');
var util = require('util');
var config = require('config');


var file = config.get('logFile');

var logLevel = 0;
// Log errors only during tests
if (process.env.NODE_ENV === 'test'){
    logLevel = 3;
}


var printDate = function(){
    var now = new Date();
    return "["
            + (('0' + now.getDate()).substr(-2))
            + "/" + ('0' + (parseInt(now.getMonth()) + 1)).slice(-2)
            + " - "
            + now.getHours() + ":" 
            + ("0" + now.getMinutes()).slice(-2) + ":"
            + ("0" + now.getSeconds()).slice(-2)
            + "]";
}

var writeFile = function(content){
    fs.appendFile(file, content + '\n', function(err){
        if (err){
            console.error(err);
        }
    })
    try {
        fs.accessSync(file, fs.F_OK);
        var stat = fs.statSync(file);
        if (stat.size > config.get('logFileSizeMegaBytes') * 1000000){ 
            console.log('Cleaning log file')
            fs.renameSync(file, file+'.old');
        }
    } catch(err){}
}

var logger = {

    info: function(msg){
        if (logLevel <= 1){
            var logMessage = printDate()
                + " info : "
                + msg;
            console.info(logMessage);
            writeFile(logMessage);
        }
    },

    debug: function(msg){
        if (logLevel <= 2){     
            var logMessage = printDate()
                + " debug : "
                + msg;
            console.log(logMessage);
            writeFile(logMessage);
        }
    },

    warn: function(msg){
        if (logLevel <= 3){     
            var logMessage = printDate()
                + " warning : "
                + msg;
            console.warn(logMessage);
            writeFile(logMessage);
        }
    },

    error: function(msg){
        if (logLevel <= 4){     
            var logMessage = printDate()
                + " error : "
                + msg;
            console.error(logMessage);
            writeFile(logMessage);
        }
    }

};

module.exports = logger;