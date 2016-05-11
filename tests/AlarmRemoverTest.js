var chai = require('chai'),
    expect = chai.expect,
    sqlite3 = require('sqlite3').verbose(),
    AlarmRemover = require('../AlarmRemover'),
    AlarmPersistence = require('../AlarmPersistence'),
    fs = require('fs');


describe('AlarmRemover', function(){

    before(function(){
        this.db = new sqlite3.Database("tests/data/test.db");
        this.almPers = new AlarmPersistence(this.db, "data");
        this.alarmRemover = new AlarmRemover(this.almPers, 60*60*24*7);

        // Backup the test database
        fs.createReadStream('tests/data/test.db').pipe(fs.createWriteStream('data/backup.db'));
    });

    // TODO
    it('Alarms older than a week should be deleted', function(){
        this.almPers.getAlarms(null, function(err, data){
            expect(1).to.equal(1);
        });  
    });

    after(function(){
        // Backup the test database
        fs.createReadStream('tests/data/backup.db').pipe(fs.createWriteStream('tests/data/test.db'));
    });

});
