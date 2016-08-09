var Service = require('node-windows').Service;

if (process.argv[2]){
    // Do something
}

// Create a new service object
var svc = new Service({
  name:'FoxWebAlarmPlayer',
  description: 'The web server for FoxWebAlarmPlayer.',
  script: 'C:\\path\\to\\main.js'
});


svc.install();