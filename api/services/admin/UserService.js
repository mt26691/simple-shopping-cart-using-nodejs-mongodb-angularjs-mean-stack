/**
* @module      :: Comment Service
* @description	:: CRUD User
*/

var model = require('../../models/models')();
var User = model.User;
var config = require("../../config/WebConfig");
module.exports = {
    //query users
    'query': function (queryData, callback) {
        var skip = 0;
        //items per page, it is used for pagination
        var itemsPerPage = config.itemsPerPage;
        if (queryData.page != null && !isNaN(queryData.page)) {
            skip = (queryData.page - 1) * itemsPerPage;
        }
        var realQueryData = {};
        if (queryData.keyword && queryData.keyword.length > 0) {
            //find user whose name or email contains queryData.keyword
            realQueryData = { 
                $or: [
                        //fint with case insentivie
                        { "name": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() +".*", 'i') }},
                        { "email": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() +".*", 'i') }} 
                    ]};
        }

        User
            .find(realQueryData)
            //query everything except the field below
            .select({ verifyAccountToken: 0, passwordResetToken: 0, password: 0, updatedAt: 0, __v: 0 })
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function (err, users) {
                if (err) {
                    return callback(err);
                }

                User.count(realQueryData, function (err, count) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, { users: users, count: count });
                });
            });
    },
    //get user base on id
    'get': function (userId, callback) {
        User
            .findOne({ _id: userId })
            .select({ verifyAccountToken: 0, passwordResetToken: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0 })
            .exec(function (err, foundUser) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundUser);
            });
    },
    
    //update user only
    'post': function (user, callback) {
        User.findOne({ _id: user.id }, function (err, foundUser) {
            if (err) {
                return callback(err);
            }
            if (!foundUser) {
                return callback(null, false, "Can not find user");
            }
            foundUser.name = user.name;
            foundUser.role = user.role;
            
            //if user change email
            if (foundUser.email != user.email) {
                //check duplicate
                User.findOne({ email: user.email }, function (err, duplicateUser) {
                    if (err) {
                        return callback(err);
                    }
                    if (duplicateUser) {
                        return callback(null, false, "duplicate email");
                    }
                    else {
                        foundUser.email = user.email;
                        foundUser.save(function (err, savedUser) {
                            return callback(null, true, "User saved");
                        });
                    }
                });
            }
            else {
                foundUser.email = user.email;
                //if email is not change
                foundUser.save(function (err, savedUser) {
                    return callback(null, true, "User saved");
                });
            }
        });
    },
    
    //delete user by id
    'delete': function (userId, callback) {
        User.findOne({ _id: userId }, function (err, foundUser) {
            if (foundUser){
                User
                    .remove({ _id: userId }, function (err, result) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, true, "user deleted");
                    });
            }
            else
            {
                return callback(null,false,"user not found");
            }
        });
    },
};
