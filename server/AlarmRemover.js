var log = require('./logger');

function apply(){
    log.info('Deleting old alarms');
    var now = (new Date().getTime()) / 1000;
    this.alarmPersistence.deleteAlarmsOlderThan(now - this.duration, function () { });
}

function stop(){
    if (!this.timer){
        clearInterval(this.timer);
        this.timer = null;
        log.debug('Stopping alarm remover');
    }
}

function start(){
    if (process.env.NODE_ENV !== 'test'){
        this.apply();
    }
    if (!this.timer){
        this.timer = setInterval(this.apply.bind(this), 60*60*1000);
        log.debug('Starting alarm remover');
    }  
}

/**
  * AlarmRemover constructor
  * @param alarmPersistence reference to adequate AlarmPersistence object
  * @param duration Alarms older than duration, in seconds, will be deleted
  */
function AlarmRemover(alarmPersistence, duration)
{
    if(!this) return new AlarmRemover(alarmPersistence, duration)
    
    this.alarmPersistence = alarmPersistence;
    this.duration = duration;
    this.timer = null;
}

AlarmRemover.prototype.start = start;
AlarmRemover.prototype.stop = stop;
AlarmRemover.prototype.apply = apply;

module.exports = AlarmRemover;