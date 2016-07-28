let fs = require('fs');
let async = require('async');
let jsonfile = require('jsonfile');

let translationKeys = [];

let extractKeysFromContent = (content) => {
    var regexp = new RegExp("{{.+translate }}", 'g');
    do {
        match = regexp.exec(content);
        if (match){
            var key = match[0];
            // Keep the key only ( "key" | translate )
            key = key.substr(4);
            let length = key.length;
            translationKeys.push(key.substr(0, length - 16));
        }
    } while(match)
};

let updateJsonFiles = (keys) => {
    // Get JSON objects
    fs.readdir('./locale', (err, filenames) => {
        if (err){
            console.log(err);
            return;
        }
        filenames.forEach((localeFile) => {
            jsonfile.readFile('./locale/' + localeFile, function(err, obj){
                // Check if the detected keys are in the file
                let missing = false;
                translationKeys.forEach((key) => {
                    if (!obj[key]){
                        missing = true;
                        obj[key] = "";
                    }
                });
                if (missing){
                    console.log('WARNING : Missing keys in ./locale/' + localeFile);
                }
                jsonfile.writeFile('./locale/' + localeFile, obj, {spaces: 2}, (err) => {
                    if (err){
                        console.error(err);
                    }
                })
            });
        });
    });
};


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
            extractKeysFromContent(content);
            callback();
        });
    }, () => {
        updateJsonFiles(translationKeys);
    });
});







