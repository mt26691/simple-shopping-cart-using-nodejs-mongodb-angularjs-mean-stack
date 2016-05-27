/**
* Article Routes
*
* @module      :: Customer Order Routes
* @description	:: perform request that related to article management module
*/
var express = require('express');
var router = express.Router();
var customerOrderController = require("../controllers/v1/CustomerOrderController");
var checkIn = require("../policies/checkin");
var isAuthenticated = require("../policies/isAuthenticated");

//get all orders
router.get('/', [checkIn, customerOrderController.query]);

//get current order
router.get('/current', [checkIn, customerOrderController.query]);

//get order base on id
router.get('/:id', [checkIn, isAuthenticated, customerOrderController.query]);

router.post('/addToCart', [checkIn, customerOrderController.getCurrentCart, customerOrderController.addToCart]);
router.post('/checkout', [checkIn, customerOrderController.post]);
// router.post('/review', [checkIn, isAuthenticated, customerOrderController.post]);

module.exports = router;
