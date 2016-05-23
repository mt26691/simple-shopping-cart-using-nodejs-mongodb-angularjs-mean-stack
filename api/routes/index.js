/**
* Index Routes
*
* @module      :: Index Routes
* @description	:: we use index route to generate right layout page for clients
*/

var express = require('express');
var router = express.Router();
var checkIn = require("../policies/checkin");
var isAuthenticated = require("../policies/isAuthenticated");
var isAdmin = require("../policies/isAdmin");
var isAdmin = require("../policies/isAdmin");
var authController = require("../controllers/v1/AuthController");
var homeController = require("../controllers/v1/HomeController")

//get admin page
router.get('/admin', [checkIn, isAdmin, function (req, res, next) {
    res.render('layout_admin.html');
}]);

//get admin page
router.get('/admin/*', [checkIn, isAdmin, function (req, res, next) {
    res.render('layout_admin.html');
}]);
router.get('/log-out', authController.logout);
/* GET home page. */
router.get('/*', function (req, res, next) {
    res.render('layout.html');
});



module.exports = router;
