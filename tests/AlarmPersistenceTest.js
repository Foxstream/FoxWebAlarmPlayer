var chai = require('chai'),
    expect = chai.expect,
    sqlite3 = require('sqlite3').verbose(),
    AlarmPersistence = require('../AlarmPersistence'),
    fs = require('fs');


describe('AlarmPersistence', function(){

    // before(function(){
    //     this.db = new sqlite3.Database("tests/data/test.db");
    //     this.almPers = new AlarmPersistence(this.db, "data");

    //     // Backup the test database
    //     fs.createReadStream('data/test.db').pipe(fs.createWriteStream('data/backup.db'));
    // });


    // after(function(){
    //     // Repopulate the test database
    //     fs.createReadStream('data/backup.db').pipe(fs.createWriteStream('data/test.db'));
    // });

});
