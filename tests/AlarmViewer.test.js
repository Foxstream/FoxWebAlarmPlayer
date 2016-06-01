describe('first test', function(){
    var scope;

    beforeEach(function(){

        angular.mock.module('alarmviewer');
        angular.mock.inject(function($controller, $rootScope){
            scope = $rootScope.$new();
            controller = $controller('alarmcontroller', {
                $scope: scope
            });
            alarm1 = {id: 1, timestamp: 1464274726, cameraname: "Cam_01", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 0 };
            alarm2 = {id: 2, timestamp: 1464274736, cameraname: "Cam_02", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 0 };
            alarm3 = {id: 3, timestamp: 1464274785, cameraname: "Cam_01", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 0 };
            scope.alarms = [alarm1, alarm2, alarm3];
        });
    });

    it('GetNextAlarm should return the next alarm to play on mobile or -1', function(){
        
        scope.currentalarm = alarm1;
        expect(scope.getNextAlarm()).to.equal(1);
        scope.currentalarm = alarm2;
        expect(scope.getNextAlarm()).to.equal(2);

        scope.currentalarm = alarm3;
        expect(scope.getNextAlarm()).to.equal(0);

        scope.alarms.splice(1, 2);
        scope.currentalarm = alarm1;
        expect(scope.getNextAlarm()).to.equal(-1);

    });


});