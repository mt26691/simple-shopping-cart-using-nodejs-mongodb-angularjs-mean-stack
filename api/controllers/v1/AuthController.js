/**
* Auth Controller
*
* @module      :: Auth Controller
* @description	:: Auth Controller for login, logout
*/

var authService = require("../../services/AuthService");
var jwtService = require("../../services/JWTService");
module.exports = {
    
     //Login method
    'login': function(req, res) {
        //get post data
        var data = { email: req.body.email, password: req.body.password, isRemember: req.body.isRemember };
        authService.login(data, function(err, user) {
            if (err) {
                return res.status(200).json({ err: true, msg: "server error" });
            }
            //if user is not found
            if (!user) {
                return res.status(200).json({ err: true, msg: "Wrong username or password" });
            }
            //if user login successfully
            else {
                //set expiresTime default to one hour
                var expiresTime = 60 * 60 * 1000;
                //if user is check remember me option, set expiresTime to 14 days
                if (data.isRemember) {
                    //14 days 14h 60 min 60s 1000 milisecond    
                    expiresTime = 14 * 24 * 60 * 60 * 1000;
                }
                
                //save with new access token
                var clientToken = jwtService.issueToken(user.accessToken);

                var returnUser = { name: user.name, role: user.role, accessRight: user.accessRight };

                var returnedData = { token: clientToken, isRemember: data.isRemember };

                //issue new cookie
                res.cookie("AuthSession", returnedData, { expires: new Date(Date.now() + expiresTime), httpOnly: true });

                res.status(200).json({ user: returnUser });
            }
        });
    },
    
    //let user logout
    'logout': function(req, res) {
        if (req.user) {
            //delete current access token
            authService.logout(req.user, function(err, result) {
            });
        }
        res.clearCookie('AuthSession');
        res.redirect('/');
    }
};
