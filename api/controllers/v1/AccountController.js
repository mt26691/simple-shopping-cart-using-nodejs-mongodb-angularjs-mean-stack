/**
* User Controller
*
* @module      :: Account Controller
* @description	:: register new user,changepassword, send password reset email.
*/

var model = require('../../models/models')();
var User = model.User;
var accountService = require("../../services/AccountService");
var jwtService = require("../../services/JWTService");

module.exports = {
    
    //Register new user with name, email and password
    'register': function(req, res) {
        var registerData = { email: req.body.email, name: req.body.name, password: req.body.password };
        //register new user
        accountService.register(registerData, function(err, result, msg, newUser) {
            if (err) {
                return res.status(200).json({ err: true, msg: "server error" });
            }
            if (!result) {
                return res.status(200).json({ err: true, msg: msg });
            }
            return res.status(200).json({ email: newUser.email, isSuccess: true });
        });
    },

    //logged in users can change their password
    changePassword: function(req, res) {
        
        var changePasswordData = { currentPassword: req.body.currentPassword, password: req.body.password, id: req.user.id };

        accountService.changePassword(changePasswordData, function(err, result, msg, newToken) {
            if (err) {
                return res.json({ err: true, msg: "unexpected error while changing password" });
            }
            
            //if user can not change password
            if (result === false) {
                return res.json({ err: true, msg: msg });
            }
            
            //data return back to client, we use jwtService to encrypt cookie
            var returnedData = { token: jwtService.issueToken(newToken), isRemember: req.cookies.AuthSession.isRemember };

            //cookie default expired date
            var expiresTime = 60 * 60 * 1000;
            //if user check is rember me option, we will set cookie expired date to 14 days
            if (req.cookies.AuthSession.isRemember) {
                //14 days 14h 60 min 60s 1000 milisecond    
                expiresTime = 14 * 24 * 60 * 60 * 1000;
            }

            //issue new cookie
            res.cookie("AuthSession", returnedData, { expires: new Date(Date.now() + expiresTime), httpOnly: true });

            //return result to client
            res.json({ err: false, msg: "Password is changed sucessfully." });

        });
    },
    
    //logged in users can change their profile
    changeProfile: function(req, res) {
        var data = {};
        data.name = req.body.name;
        data.id = req.user.id;

        if (data.name == null) {
            return res.json({ err: true, msg: "Name is missing" });
        }

        accountService.changeProfile(data, function(err, result, msg, savedUser) {
            return res.json({ err: !result, msg: msg });
        });
    },

    /**
    * Create a new password reset token and send 
    * an email with instructions to user
    */
    sendPasswordResetEmail: function(req, res) {
        var email = req.body.email;
        if (!email) {
            return res.status(200).json({ err: true, msg: "Email not found." });
        }
        
        User.findOne({ email: email }, function(err, user) {
            if (err) return res.serverError(err);
            //if user is not found
            if (!user) {
                return res.json({ err: true, msg: "Email not found" });
            }
            //if user is found, send reset email which contains password reset token
            user.sendPasswordResetEmail(function() {
                return res.json({ email: user.email });
            });

        });
    },

    /**
     * POST request, which contains user id and reset token
     * @param  {any} req, POST request
     * @param  {any} res, return json
     */
    getResetPasswordData: function(req, res) {

        var passwordResetToken = req.body.passwordResetToken;
        //check password reset token
        if (!passwordResetToken || passwordResetToken.length < 32 || passwordResetToken.length > 40) {
            return res.json({ err: true, msg: "Token is missing" });
        }

        //Find user by password reset token
        User.findOne({ "passwordResetToken.value": passwordResetToken }, function(err, user) {
            if (err) return res.status(500);
            
            //if user can not be found
            if (!user) {
                return res.json({ err: true, msg: "Link is wrong." });
            }
            //if token is invalid
            var expires = new Date().setHours(new Date().getHours() - 48);
            var isssueAt = new Date(user.passwordResetToken.issuedAt);

            if (isssueAt.getTime() <= expires) {
                return res.status(200).json({ err: true, msg: "Link is expired." });
            }

            return res.status(200).json({ name: user.name, email: user.email });
        });
    },

    /**
    * Update user password 
    * Expects and consumes a password reset token
    */
    resetPassword: function(req, res) {

        var resetPasswordData = { password: req.body.password, passwordResetToken: req.body.passwordResetToken };
        if (!resetPasswordData.passwordResetToken || !resetPasswordData.password) {
            return res.status(200).json({ err: true, msg: "Unexpected token" });
        }
        accountService.resetPassword(resetPasswordData, function(err, savedUser) {
            if (err) {
                return res.status(200).json({ err: true, msg: "Server error." });
            }
            //reset password and let user login
            else {
                req.user = savedUser;
                return res.json({ email: savedUser.email });
            }
        });
    },
        
    //get user profile
    getProfile: function(req, res) {
        var userId = req.query.userId;
        if (userId == null) {
            return res.status(200).json({ err: true, msg: "User id is missing" });
        }
        accountService.getProfile(userId, function(err, foundUser) {
            if (err) {
                res.status(200).json({ err: true, msg: "Exp" });
            }
            else {
                res.status(200).json({ err: false, user: foundUser });
            }
        })
    },
    
    //get current user data
    me: function(req, res) {
        if (req.user == null) {
            return res.status(200).json({});
        }
        
        return res.status(200).json({ name: req.user.name, email: req.user.email, role: req.user.role, accessRight: req.user.accessRight });
    }
};
