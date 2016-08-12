var Service = require('node-windows').Service;
var jsonfile = require('jsonfile');
var async = require('async');

// Create a new service object
var svc = new Service({
  name:'FoxWebAlarmPlayer',
  description: 'The web server for FoxWebAlarmPlayer.',
  script: __dirname + '\\main.js',
  env: [
    {name: "NODE_ENV", value: "production"},
    {name: "NODE_CONFIG_DIR", value: __dirname + "\\config"}
  ]
});


if (process.argv[2] && process.argv[2] === '--uninstall'){
    removeService(svc);
} else if (process.argv[2] && process.argv[2] === '--start'){
    startService(svc, function(){});
} else if (process.argv[2] && process.argv[2] === '--stop'){
    stopService(svc);
} else {
    async.series([updateConfFile, function(done){ createService(svc, done); }]);
}

function updateConfFile(done){
    console.log("Updating 'dbHost' key in config/production.json...");
    jsonfile.readFile('./config/production.json', function(err, config){
        if (err){
            console.log(err);
            process.exit(1);
        }
        config["dbHost"] = __dirname + "\\server\\data\\alarmplayer.db";
        jsonfile.writeFile('./config/production.json', config, {spaces: 2}, (err) => {
            if (err){
                console.log("Unabl to update config file");
                console.error(err);
                process.exit(1);
            } else {
                console.log("Config file updated");
                done();
            }
        })
    });
}

function createService(service, done){

    console.log('Installing service...')

    service.on('install', function(){
        console.log('Starting service...')
        startService(service, done);
    });
    service.on('invalidinstallation', function(){
        console.log('Invalid installation');
    });
    service.on('error', function(){
        console.log('Error')
    });
    service.on('alreadyinstalled', function(){
        console.log('Service already installed');
        startService(service, done);
    });
     
    service.install();
}

function startService(service, done){
    service.on('start', function(){
        console.log('Service started.');
    });
    service.on('error', function(){
        console.log('Error')
    });
    service.start();
    done();
}

function stopService(service){
    service.on('stop', function(){
        console.log('Service stopped.');
    });
    service.on('error', function(){
        console.log('Error')
    });
    service.stop();
}

function removeService(service){
    service.on('uninstall',function(){
        console.log('Uninstall complete.');
    });

    service.uninstall();
}