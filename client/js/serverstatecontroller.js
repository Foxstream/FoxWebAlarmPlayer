
app.controller('serverstatecontroller', ["$rootScope", "$scope", "serverdb", 'alarmevents', '$translate', function ($rootScope, $scope, serverdb, alarmevents, $translate) {
	$scope.ServerState={};
	$scope.CameraAnalysis=0;
	$scope.TotalCameras=0;
	$scope.ServerStateInit = false;
	
	$scope.EnableAnalysis=function(){
		serverdb.enableanalysis(true);
		$scope.ServerStateInit = false;
	}
	$scope.DisableAnalysis=function(){
		serverdb.enableanalysis(false);
		$scope.ServerStateInit = false;
	}
	
	function analysisUpdate(event, data)
	{
		$scope.ServerState[data.server.id] = data.state;
		$scope.ServerStateInit = true;
		
		var camTrue = 0;
		var camCount = 0;
		for(var serverId in $scope.ServerState)
		{
			var server = $scope.ServerState[serverId]
			for(var cam in server)
			{
				camCount++;
				if (server[cam].state)
					camTrue++;
			}
		}
		
		$scope.CameraAnalysis = camTrue;
		$scope.TotalCameras = camCount;
	}
	
	var unbind = $rootScope.$on("analysisState", analysisUpdate);
    $scope.$on('$destroy', unbind);
	
}]);