/**
* @module      :: Auth Service
* @description	:: log in, log out
*/

var model = require('../models/models')();
var User = model.User;
var AccessToken = model.AccessToken;
var crypto = require("crypto");
module.exports = {
    //help user log in to system
    'login': function (values, callback) {
        //check user email
        User.findOne({ email: values.email }, function (err, foundUser) {
            if (err) {
                return callback(err);
            }
            //if email not found, return false
            if (!foundUser) {
                return callback(null, false);
            }
            //email found, compare user's password with current password
            foundUser.comparePassword(values.password, function (err, isMatch) {
                if (err) {
                    return callback(err);
                }
                //if passowrd is not match
                if (!isMatch) {
                    return callback(null, false);
                }
                //if passowrd is match, create access token to let user log in to system
                else {
                    var accessToken = {
                        key: crypto.randomBytes(48).toString('base64'),
                        user: foundUser.id
                    }
                    //create new access Token
                    AccessToken.create(accessToken, function (err, savedToken) {
                        foundUser.accessToken = accessToken.key;
                        return callback(null, foundUser);
                    });

                }
            });
        });
    },
    //current user with access token
    'logout': function (user, callback) {
        //delete current access token
        AccessToken.remove({ key: user.accessToken }, function (err, resData) {
            if (err) {
                return callback(err);
            }
            callback(null, true);
        });
    }

};
