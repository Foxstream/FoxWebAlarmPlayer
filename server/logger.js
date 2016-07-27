var logLevel = 0;
if (process.env.NODE_ENV === 'test'){
    logLevel = 3;
}
module.exports = require('custom-logger').config({level: logLevel});
