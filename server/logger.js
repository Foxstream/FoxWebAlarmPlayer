/** LOG LEVELS
    1. INFO
    2. DEBUG
    3. WARNING
    4. ERROR
**/

var fs = require('fs');
var util = require('util');
var config = require('config');
var chalk = require('chalk');


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
            var logMessage = 
                  chalk.gray(printDate())
                + chalk.green(" info : ")
                + msg;
            console.info(logMessage);
            logMessage = printDate() + " info : " + msg;
            writeFile(logMessage);
        }
    },

    debug: function(msg){
        if (logLevel <= 2){     
            var logMessage = 
                  chalk.gray(printDate())
                + chalk.cyan(" debug : ")
                + msg;
            console.log(logMessage);
            logMessage = printDate() + " debug : " + msg;
            writeFile(logMessage);
        }
    },

    warn: function(msg){
        if (logLevel <= 3){     
            var logMessage = 
                  chalk.gray(printDate())
                + chalk.yellow(" warning : ")
                + msg;
            console.warn(logMessage);
            logMessage = printDate() + " warning : " + msg;
            writeFile(logMessage);
        }
    },

    error: function(msg){
        if (logLevel <= 4){     
            var logMessage = 
                  chalk.gray(printDate())
                + chalk.red(" error : " + msg);
            console.warn(logMessage);
            logMessage = printDate() + " error : " + msg;
            writeFile(logMessage);
        }
    }

};

module.exports = logger;