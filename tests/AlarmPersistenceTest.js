var chai = require('chai'),
    expect = chai.expect,
    sqlite3 = require('sqlite3').verbose(),
    AlarmPersistence = require('../AlarmPersistence'),
    fs = require('fs');


describe('AlarmPersistence', function(){

    before(function(){
        this.db = new sqlite3.Database("tests/data/test.db");
        this.almPers = new AlarmPersistence(this.db, "data");

        // Backup the test database
        // fs.createReadStream('data/test.db').pipe(fs.createWriteStream('data/backup.db'));
    });

    // TODO
    it('Alarms returned by getAlarms', function(){
        this.almPers.getAlarms(null, function(err, data){
            expect(data).to.equal([ { id: 1,
    timestamp: 1462958596,
    cameraname: 'Cam_1',
    hostname: 'FoxBox ',
    sitename: 'Site ',
    handled: 0,
    nbimages: 21 },
  { id: 2,
    timestamp: 1462958601,
    cameraname: 'Cam_2',
    hostname: 'FoxBox ',
    sitename: 'Site ',
    handled: 0,
    nbimages: 21 },
  { id: 3,
    timestamp: 1462958686,
    cameraname: 'Cam_1',
    hostname: 'FoxBox ',
    sitename: 'Site ',
    handled: 0,
    nbimages: 21 } ]);
            expect(err).to.equal(null);
        });  
    });

    after(function(){
        // Backup the test database
        // fs.createReadStream('data/backup.db').pipe(fs.createWriteStream('data/test.db'));
    });

});
