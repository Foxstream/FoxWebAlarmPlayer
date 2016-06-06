describe('Alarmviewer controller tests', function(){
    var scope;

    beforeEach(function(){

        angular.mock.module('alarmviewer');
        angular.mock.inject(function($controller, $rootScope){
            scope = $rootScope.$new();
            controller = $controller('alarmcontroller', {
                $scope: scope
            });
            alarm1 = {id: 1, timestamp: 1464274726, cameraname: "Cam_01", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 0 };
            alarm2 = {id: 2, timestamp: 1464274736, cameraname: "Cam_02", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 1 };
            alarm3 = {id: 3, timestamp: 1464274785, cameraname: "Cam_01", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 0 };
            alarm4 = {id: 4, timestamp: 1464274811, cameraname: "Cam_01", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 0 };
            
            scope.alarms = [alarm1, alarm2, alarm3, alarm4];

            alarm5 = {id: 0, timestamp: 1464274811, cameraname: "Cam_01", hostname: "FoxBox", sitename: "Site", nbImage: 21, handled: 1 };

        });
    });

    it('Should return alarms that are not hamdled', function(){
        expect(scope.getNotHandledAlarms()).to.deep.equal([alarm1, alarm3, alarm4]);
    });

    it('GetNextAlarm should return the next alarm to play on mobile or -1', function(){
        
        // Should ignore alarm2 because it is marked as handled
        scope.currentalarm = alarm1;
        expect(scope.getNextAlarm()).to.equal(2);
        // Normal use case
        scope.currentalarm = alarm3;
        expect(scope.getNextAlarm()).to.equal(3);

        // End of list
        scope.currentalarm = alarm4;
        expect(scope.getNextAlarm()).to.equal(0);

        // Handled alarm at beginning of list
        scope.alarms.unshift(alarm5);
        scope.currentalarm = alarm4;
        expect(scope.getNextAlarm()).to.equal(1);

        // Handled alarm at the end of the list
        scope.alarms.push(alarm5);
        scope.currentalarm = alarm4;
        expect(scope.getNextAlarm()).to.equal(1);

        // Returns -1 when there is no next alarm
        scope.alarms = [alarm1];
        scope.currentalarm = alarm1;
        expect(scope.getNextAlarm()).to.equal(-1);

    });


    it('GetPreviousAlarm should return the previous alarm to play on mobile or -1', function(){
        
        // Should ignore alarm2 because it is marked as handled
        scope.currentalarm = alarm3;
        expect(scope.getPreviousAlarm()).to.equal(0);
        // Normal use case
        scope.currentalarm = alarm4;
        expect(scope.getPreviousAlarm()).to.equal(2);

        // Beginning of list
        scope.currentalarm = alarm1;
        expect(scope.getPreviousAlarm()).to.equal(3);

        // Handled alarm at end of list
        scope.alarms.push(alarm5);
        scope.currentalarm = alarm1;
        expect(scope.getPreviousAlarm()).to.equal(3);

        // Handled alarm at beginning of list
        scope.alarms.unshift(alarm5);
        scope.currentalarm = alarm1;
        expect(scope.getPreviousAlarm()).to.equal(4);

        scope.alarms = [alarm1];
        scope.currentalarm = alarm1;
        expect(scope.getPreviousAlarm()).to.equal(-1);

    });


});