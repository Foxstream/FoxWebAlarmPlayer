function LoadImages(httpService, alarm, cb)
{
    if (!alarm.hasOwnProperty("Images")) {
        alarm.Images = [];
        var counter = 0;
        var dataLoaded = function () {            
            if (++counter == 2 * alarm.nbimages) cb();
        };

        for (var i = 0; i < alarm.nbimages; i++) {
            alarm.Images[i] = { Image : new Image() };
            alarm.Images[i].Image.addEventListener("load", dataLoaded);
            alarm.Images[i].Image.src = "/alarms/" + alarm.id + "/image/"+i+"/jpg";

            httpService.get("/alarms/" + alarm.id + "/image/" + i + "/osd").success(function (idx) {
                return function (data) {
                    alarm.Images[idx].OSD = data;                    
                    dataLoaded();
                };
            }(i)).error(dataLoaded);
        }        
    }
    else
        cb();
}
