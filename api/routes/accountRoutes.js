/**
* Account Routes
*
* @module      :: Account Routes
* @description	:: perform request that related to user account
*/

var express = require('express');
var router = express.Router();
var accountController = require("../controllers/v1/AccountController");
var checkIn = require("../policies/checkin");
var isAuthenticated = require("../policies/isAuthenticated");

router.post('/register', accountController.register);

router.get('/getProfile', accountController.getProfile);

router.post('/sendPasswordResetEmail', accountController.sendPasswordResetEmail);

router.post('/getResetPasswordData', accountController.getResetPasswordData);

router.post('/resetPassword', accountController.resetPassword);

//if user want to change password, you must check whether they are logged in  or not
router.post('/changePassword', [checkIn, isAuthenticated, accountController.changePassword]);

//if user want to change profile, you must check whether they are logged in  or not
router.post('/changeProfile', [checkIn, isAuthenticated, accountController.changeProfile]);

router.get('/me', [checkIn, accountController.me]);

module.exports = router;
