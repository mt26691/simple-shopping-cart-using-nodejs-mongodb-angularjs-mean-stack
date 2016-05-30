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

// //get all orders
// router.get('/', [checkIn, customerOrderController.query]);

// //get current order
router.get('/currentCart', [checkIn, customerOrderController.getCurrentCart]);

router.get('/allOrders', [checkIn, isAuthenticated, customerOrderController.getAllOrders]);

router.get("/getByTrackingCode", [customerOrderController.getByTrackingCode]);
// //get order base on id
// router.get('/:id', [checkIn, isAuthenticated, customerOrderController.query]);

router.post('/addToCart', [checkIn, customerOrderController.addToCart]);
router.post('/checkout', [checkIn, customerOrderController.checkout]);
// router.post('/review', [checkIn, isAuthenticated, customerOrderController.post]);

module.exports = router;
