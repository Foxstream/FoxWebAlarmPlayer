let fs = require('fs');
let async = require('async');
let jsonfile = require('jsonfile');

let translationKeys = [];
let missing = [];

let extractKeysFromJadeFile = (content) => {
    var regexp = new RegExp("{{ [A-Z_'\| ]+translate }}", 'g');
    do {
        match = regexp.exec(content);
        if (match){
            var key = match[0];
            // Keep the key only ( {{ "key" | translate }} )
            key = key.substr(4);
            let length = key.length;
            translationKeys.push(key.substr(0, length - 16));
        }
    } while(match)
};

let extractKeysFromController = (content) => {
    var regexp = new RegExp('sendnotification\\("[A-Z_]+', 'g');
    do {
        match = regexp.exec(content);
        if (match){
            var key = match[0];
            // Keep the key only ( sendnotification("ABC )
            key = key.substr(18);
            // let length = key.length;
            translationKeys.push(key);
        }
    } while(match)
};

let updateJsonFiles = (keys, cb) => {
    // Get JSON objects
    fs.readdir('./locale', (err, filenames) => {
        if (err){
            console.log(err);
            return;
        }
        async.each(filenames, (localeFile, localCb) => {
            jsonfile.readFile('./locale/' + localeFile, function(err, obj){
                if (err){
                    console.error(err);
                    return;
                }

                // Check if the keys are in the file
                translationKeys.forEach((key) => {
                    if (!obj.hasOwnProperty(key)){
                        obj[key] = "";
                        if (missing.indexOf(localeFile) === -1){
                            missing.push(localeFile);
                        }
                    }
                });

                // Update file
                jsonfile.writeFile('./locale/' + localeFile, obj, {spaces: 2}, (err) => {
                    if (err){
                        console.error(err);
                    }
                    localCb();
                })
            });
        }, cb);
    });
};

async.series([
    function(done){
        fs.readdir('./views', (err, filenames) => {
            if (err){
                console.error(err);
                return;
            } 
            async.each(filenames, (filename, callback) => {
                fs.readFile('./views/' + filename, 'utf-8', (err, content) => {
                    if (err){
                        console.error(err);
                        return;
                    }
                    extractKeysFromJadeFile(content);
                    callback();
                });
            }, () => {
                updateJsonFiles(translationKeys, done);
            });
        });
    }, function(done){
        fs.readdir('./js', (err, filenames) => {
            if (err){
                console.error(err);
                return;
            } 
            async.each(filenames, (filename, callback) => {
                fs.readFile('./js/' + filename, 'utf-8', (err, content) => {
                    if (err){
                        console.error(err);
                        return;
                    }
                    extractKeysFromController(content);
                    callback();
                });
            }, () => {
                updateJsonFiles(translationKeys, done);
            });
        });
    }], function(){
        if (missing.length > 0){
            missing.forEach((f) => {
                console.log('WARNING: missing keys in file ' + f);
            });   
        }
    }
);







