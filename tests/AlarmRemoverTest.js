var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    AlarmRemover = require('../AlarmRemover'),
    fs = require('fs');


describe('AlarmRemover', function(){

    // Runs before all tests
    before(function(){
        this.clock = sinon.useFakeTimers();
        this.alarmRemover = new AlarmRemover(null, 60*60*24*7);
    }); 

    it('Old alarms are deleted every hour', function(){
        
        this.alarmRemover.start();
        sinon.spy(this.alarmRemover, 'apply');
        console.log(this.alarmRemover.timer)

        this.clock.tick(1000*60*60);
        expect(this.alarmRemover.apply.NotCalled).not.to.be.true;

        this.alarmRemover.apply.restore();

        this.alarmRemover.stop();

    });

    // Runs after all tests
    after(function(){
        this.clock.restore();
    });

});
