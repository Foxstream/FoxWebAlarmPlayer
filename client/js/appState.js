app.factory('appstate', function(){

    var obj = {};

    obj.saveState = function(key, value){
        try {localStorage.setItem(key, value);}catch(err){}
    };

    obj.getState = function(key){
        try {return parseInt(localStorage.getItem(key));}catch(err){}
		return 0;
    };

    return obj;

});