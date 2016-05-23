/**
* isAdmin policy
* @module      :: Check current logged in user is admin or not
*/

var model = require('../models/models');
var jwtService = require('../services/JWTService');
module.exports = function(req, res, next) {
    //if current user is admin
    if (req.user && req.user.role == "admin") {
        next();
    } else {
        //if current user is not admin, forbid them to request server's resource
        return res.status(401).json({ err: true, msg: "You don't have the right to access this page" });
    }
};
