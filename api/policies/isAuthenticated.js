/**
* is Authenticated
* @module      :: check current user is logged or not
*/

var model = require('../models/models');
var jwtService = require('../services/JWTService');
module.exports = function(req, res, next) {
    //if user is logged in
    if (req.user) {
        next();
    } else {
        //if user is not logged, redirect them to log in page
        res.clearCookie('AuthSession');
        return res.redirect('/log-in');
    }

};
