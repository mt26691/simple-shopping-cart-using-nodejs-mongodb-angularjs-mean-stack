/**
* Auth Routes
*
* @module      :: Auth Routes
* @description	:: Login/logout
*/

var express = require('express');
var router = express.Router();
var authController = require("../controllers/v1/AuthController");
var checkIn = require("../policies/checkin");

//login
router.post('/login/local', authController.login);

//log out
router.get('/logout', [checkIn, authController.logout]);

module.exports = router;
