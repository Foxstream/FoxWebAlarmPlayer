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
        
        var apply = sinon.stub(this.alarmRemover, 'apply');

        this.alarmRemover.start();

        this.clock.tick(1000*60*60 - 1000);
        expect(this.alarmRemover.apply.notCalled).to.be.true;

        this.clock.tick(1000);
        expect(this.alarmRemover.apply.calledOnce).to.be.true;

        this.clock.tick(1000*60*60);
        expect(this.alarmRemover.apply.callCount).to.equal(2);

        this.alarmRemover.apply.restore();

        this.alarmRemover.stop();

    });

    // Runs after all tests
    after(function(){
        this.clock.restore();
    });

});