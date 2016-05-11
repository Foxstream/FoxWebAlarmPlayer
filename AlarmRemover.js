function apply()
{
    var now = (new Date().getTime()) / 1000;
    console.log("Deleting old alarms");
    this.alarmPersistence.deleteAlarmsOlderThan(now - this.duration, function () { });
}

function stop()
{
    if (!this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
}

function start()
{    
    if (this.timer)
        this.timer = setInterval(apply.bind(this), 60*60*1000);    
}

function AlarmRemover(alarmPersistence, durationSeconds)
{
    if(!this) return new AlarmRemover(alarmPersistence, durationSeconds)
    
    this.alarmPersistence = alarmPersistence;
    this.duration = durationSeconds;
    this.timer = null;
}

AlarmRemover.prototype.start = start;
AlarmRemover.prototype.stop = stop;

module.exports = AlarmRemover;