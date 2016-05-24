var async = require("async");
var passwordHash = require('password-hash-and-salt');

function open(cb) {
    var self = this;
    async.waterfall([
        function (callback) {
            self.db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, login TEXT, displayname TEXT, password TEXT, type INTEGER)", callback);
        },
        function (callback) {
            self.db.get("SELECT count(*) as count FROM user WHERE type=1", callback);
        },
        function (countData, callback) {
            if (countData.count == 0)
                self.addUser({login:"admin", displayname:"admin", password:"admin", type:1}, callback);
            else
                callback(null);
        },
    ], cb);    
}

function close(){

}

//if password is present, is updated, otherwise is not changed
function updateuser(user, cb)
{
    var self = this;
    if (user.password || user.password=='') {
        async.waterfall([
            function (local_cb)
            {
                if (user.password == '')
                    local_cb(null, '');
                else
                    passwordHash(user.password).hash(local_cb);
            },
            function (computed_pass, local_cb) {
                self.db.run("UPDATE user SET displayname=?, password=?, type=? WHERE id=?",
	                [user.displayname, computed_pass, user.type, user.id], local_cb);
            }
        ], cb)        
    }
    else
        this.db.run("UPDATE user SET displayname=?, type=? WHERE id=?",
	          [user.displayname, user.type, user.id], cb);
}

function checkuser(username, password, cb) {
    var self = this;
    async.waterfall([
        function (local_cb) {
            self.db.get("SELECT id, login, displayname, password, type FROM user WHERE login=?", username, function(err, user){
                if (err){
                    local_cb(err, null);
                } else {
                    local_cb(null, user);
                }
            }); 
        },
        function (user, local_cb) {
            if (user){
                passwordHash(password).verifyAgainst(user.password, function (err, verified) {
                    local_cb(err, verified, user)
                }); 
            }
            else
                local_cb(null, false, null);
        },
        function (verified, user, local_cb) {   
            if (verified || (user && user.password == '')) {
                user.shouldChangePassword = password == '';
                user.password = undefined;
                local_cb(null, user);
            }
            else
                local_cb(null, false);
        }], cb);
}

function deleteuser(userId, cb)
{
    this.db.run("DELETE FROM user WHERE id=?", [userId], cb);
}

function resetuser(userId, cb) {
    this.db.run("UPDATE user SET password='' WHERE id=?", [userId], cb);
}


function adduser(user, cb) {
    var self = this;
    async.waterfall([
        function (local_cb) {
            if (user.password == '')
                local_cb(null, '');
            else
                passwordHash(user.password).hash(local_cb);
        },
        function (computed_pass, local_cb) {
            self.db.run("INSERT INTO user(id, login, displayname, password, type) VALUES(?, ?, ?, ?, ?)",
	                                [user.id, user.login, user.displayname, computed_pass, user.type],
                function (err) {
                if (!err)
                    user.id = this.lastID;
                local_cb(err);
            });
        }], cb);
}

function getuser(id, cb){
    this.db.get("SELECT id, login, displayname, type, password=='' as shouldChangePassword FROM user WHERE id=?", id, cb);
}

function getusers(cb) {
    this.db.all("SELECT id, login, displayname, type, password=='' as shouldChangePassword FROM user", cb);
}


function UserPersistence(db) {
    if (!this) return new UserPersistence(dbFileName);
    this.db = db;
}

UserPersistence.prototype.open = open;
UserPersistence.prototype.close = close;

UserPersistence.prototype.getUser = getuser;
UserPersistence.prototype.getUsers = getusers;

UserPersistence.prototype.addUser = adduser;
UserPersistence.prototype.updateUser = updateuser;
UserPersistence.prototype.deleteUser = deleteuser;

UserPersistence.prototype.resetUser = resetuser;

UserPersistence.prototype.checkUser = checkuser;

module.exports = UserPersistence;



