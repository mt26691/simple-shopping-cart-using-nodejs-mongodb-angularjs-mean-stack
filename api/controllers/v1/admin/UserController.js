/**
* User Controller
*
* @module      :: User Controller
* @description	:: CRUD user
*/

var userService = require("../../../services/admin/UserService");
module.exports = {
    //query user in database, pagination supported
    'query': function(req, res) {
        //current page
        var page = req.query.page == null ? 1 : req.query.page;
        //search key word
        var keyword = req.query.keyword == null ? "" : req.query.keyword;
        var queryData = { keyword: keyword, page: page };
        userService.query(queryData, function(err, data) {
            if (err) {
                res.status(500).json({ err: true, msg: "server error" });
            }
            else {
                //data contains users and number of user
                res.status(200).json({ data: data.users, count: data.count });
            }
        });
    },
    
    //get user base on id
    'get': function(req, res) {
        //get userId from request param
        var userId = req.params.id;
        if (userId != null) {
            userService.get(userId, function(err, foundUser) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "server error" });
                }
                if (!foundUser) {
                    return res.status(200).json({ err: true, msg: "can not find user" });
                }

                return res.status(200).json(foundUser);
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "user is is missing" });
        }
    },
    
    //create, update user
    'post': function(req, res) {
        var user = {};
        user.id = req.body.id;
        user.email = req.body.email;
        user.name = req.body.name;
        user.isActive = req.body.isActive;
        user.role = req.body.role;
        //check required field
        if (!user.id || !user.email || !user.name || !user.role) {
            return res.status(200).json({ err: true, msg: "missing some field" });
        }
       
        //create update user
        userService.post(user, function(err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });

    },
    //delete user
    'delete': function(req, res) {
        var userId = req.params.id;
        userService.delete(userId, function(err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error when deleting user" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });
    },
};
