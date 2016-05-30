/**
* Auth Routes
*
* @module      :: Auth Routes
* @description	:: Login/logout
*/

var express = require('express');
var router = express.Router();
var authController = require("../controllers/v1/AuthController");
var customerOrderController = require("../controllers/v1/CustomerOrderController");
var checkIn = require("../policies/checkin");

//login and then migrate cart
router.post('/login/local', authController.login);

//log out
router.get('/logout', [checkIn, authController.logout]);

module.exports = router;
