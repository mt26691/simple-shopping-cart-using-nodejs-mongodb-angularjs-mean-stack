/**
* Check in policy
*
* @module      :: Check in policy, it attach current user to request
*/

var model = require('../models/models');
var jwtService = require('../services/JWTService');
module.exports = function (req, res, next) {
    if (req.cookies.AuthSession == null) {  // if there is no AuthSession, req.user is still null -> not login
        return next();
    }

    var data = req.cookies.AuthSession;

    var token = data.token;  // clientToken
    if (token == null || token == '') {
        return next();
    }
    //decrypt user token
    jwtService.verifyToken(token, function (err, decryptedData) {
        if (err) {
            next();
        }
        var User = model().User;
        var AccessToken = model().AccessToken;
        //get only id, name, email, role
        AccessToken
            .findOne({ key: decryptedData })
            .populate('user', 'id name email role accessRight')
            .exec(function (err, foundAccessToken) {

                if (err || !foundAccessToken) {
                    return next();
                }

                req.user = foundAccessToken.user;
                var compareTime = new Date().setHours(new Date().getHours() - 1);
               
                compareTime = new Date().setHours(new Date().getHours());
                var loginTime = new Date(foundAccessToken.lastTimeUse);
                //if user login < 1h not update last time use
                //not update db, this will increase performance
                if (loginTime.getTime() < compareTime) {
                    foundAccessToken.lastTimeUse = new Date();
                    foundAccessToken.user = foundAccessToken.user.id;
                    foundAccessToken.save();
                }
                
                next();
            });

    });
};
