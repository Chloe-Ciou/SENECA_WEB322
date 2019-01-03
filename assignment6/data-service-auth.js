var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }],
});

let User;
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://yciou:yciou0614@ds159330.mlab.com:59330/web322_a6_yciou");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provide error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve("Passwords do not match");
        });
    });
};

module.exports.registerUser = function (userDate) {
    return new Promise(function (resolve, reject) {
        if (userDate.password !== userDate.password2) {
            reject("Passwords do not match", {userName: userDate.userName});
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userDate.password, salt, function (err, hash) {
                    if (err) {
                        reject('There was an error encrypting the password');
                    } else {
                        userDate.password = hash;
                        let newUser = new User(userDate);
                        newUser.save((err) => {
                            if (err) {
                                err.code == 11000 ? reject("User Name already taken") : reject("There was an error creating the user: " + err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }
    });
};

module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
            .exec()
            .then((users) => {
                if(!users){
                    reject('Unable to find user: ' + userData.userName);
                }else{
                    bcrypt.compare(userData.password, users[0].password).then((res)=>{
                        if(res === true){
                            users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                            User.update(
                                { userName: users[0].userName },
                                { $set: {loginHistory: users[0].loginHistory }},
                                { multi: false }
                            ).exec().then((() => {
                                resolve(users[0]);
                            })).catch((err) => {
                                reject("There was an error verifying the user: " + err);
                            });
                        } else{
                            reject('Incorrect Password for user: '+ userData.userName );
                        }
                    });
                }
            }).catch(() => {
                reject('Unable to find user: '+userData.userName);
            });
    });
}