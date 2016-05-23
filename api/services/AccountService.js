/**
* @module      :: Account Service
* @description	:: Regiser user, change, reset password and change profile
*/

var model = require('../models/models')();
var User = model.User;
var tokenService = require("./TokenService");
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var AccessToken = model.AccessToken;
var Subject = model.Subject;

module.exports = {

    //register new account base on name, email and password
    'register': function(registerData, callback) {
        //check duplicate email
        User.findOne({ email: registerData.email }, function(err, foundUser) {

            if (err) {
                return callback(err);
            }
            //if email is duplicate
            if (foundUser) {
                return callback(err, false, "Duplicate email");
            }
            //create new user base on name, email, password
            User.create(registerData, function(err, user) {
                if (err) {
                    return callback(err);
                }
                callback(null, true, "User registerd", user);
            })
        });
    },
    //change password, input data is current user id and password
    changePassword: function(changePasswordData, callback) {
        User.findOne({ _id: changePasswordData.id }, function(err, foundUser) {
            if (err) {
                return callback(err);
            }
            if (!foundUser) {
                return callback(null, false, "User not found");
            }
            //check current password
            if (foundUser.comparePassword(changePasswordData.currentPassword, function(err, result) {
                if (err) {
                    return callback(err);
                }
                //if current password is not match
                if (!result) {
                    return callback(null, false, "The current password is wrong.");
                }

                foundUser.password = changePasswordData.password;
                foundUser.save();
                
                //remove all access tokens belong to current user
                //it means that, we force to sign out all devices that logged in.
                AccessToken.remove({ user: foundUser.id }, function(err, result) {
                    //add new access token
                    var accessToken = {
                        key: crypto.randomBytes(48).toString('base64'),
                        user: foundUser.id,
                    }
                    //create new access token
                    AccessToken.create(accessToken, function(err) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, true, "", accessToken.key);
                    });
                });

            }));
        });
    },
    //reset password base on password access token
    resetPassword: function(changePasswordData, callback) {
        //find user base on password reset token
        User.findOne({ "passwordResetToken.value": changePasswordData.passwordResetToken }, function(err, foundUser) {
            if (err) {
                return callback(err);
            }
            //if user is not found, it means token is invalid
            if (!foundUser) {
                return callback(new Error("User is not found"));
            }
            // Check if token is expired
            var expires = new Date().setHours(new Date().getHours() - 48);

            var isssueAt = new Date(foundUser.passwordResetToken.issuedAt);
            //if token is expired
            if (isssueAt.getTime() <= expires) {
                return callback(new Error("Token expried"));
            }
            
            foundUser.password = changePasswordData.password;
            foundUser.passwordResetToken = null;
            foundUser.save(function(err, savedUser) {
                if (err) return callback(err);
                //remove all access token belong to a user
                AccessToken.remove({ user: foundUser.id });
                callback(null, foundUser);
            });

        });
    },
    //change profile
    changeProfile: function(profileData, callback) {
        User.findOne({ _id: profileData.id }, function(err, foundUser) {
            if (err) {
                return callback(err);
            }
            if (!foundUser) {
                return callback(null, false, "User not found");
            }
            //change user's name
            foundUser.name = profileData.name;
            foundUser.save(function(err, savedUser) {
                if (err) {
                    return callback(err, false, "Server Error");
                }
                return callback(null, true, "Change profile successfully", savedUser);
            });

        });
    },
    //get user profile based on id.
    getProfile: function(userId, callBack) {
        User
            .findOne({ _id: userId })
            .select({ name: 1, email: 1 })
            .exec(function(err, foundUser) {
                if (err) {
                    return callBack(err);
                }

                return callBack(null, foundUser);
            });
    },
};
