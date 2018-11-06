
app.factory('alarmevents', ['$rootScope',
    function ($rootScope) {
        var source = new EventSource("/events");
        var eventForwarder = function (e) {
            var jData = null;
            try { jData = JSON.parse(e.data); } catch (err) { }

            if (jData)
                $rootScope.$apply($rootScope.$emit.bind($rootScope, e.type, jData));
        };
        
        source.addEventListener('alarm_create', eventForwarder, false);
        source.addEventListener('alarm_update', eventForwarder, false);
        source.addEventListener('alarm_deleted', eventForwarder, false);
        source.addEventListener('connection', eventForwarder, false);
		source.addEventListener('analysisState', eventForwarder, false);
        
        return source;
    }
]);