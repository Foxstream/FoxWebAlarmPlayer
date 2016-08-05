var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'FoxWebAlarmPlayer',
  description: 'The web server for FoxWebAlarmPlayer.',
  script: 'C:\\path\\to\\main.js'
});


svc.install();