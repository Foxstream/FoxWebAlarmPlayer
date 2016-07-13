app.factory('appstate', function(){

    var obj = {};

    obj.saveState = function(key, value){
        localStorage.setItem(key, value);
    };

    obj.getState = function(key){
        return parseInt(localStorage.getItem(key));
    };

    return obj;

});