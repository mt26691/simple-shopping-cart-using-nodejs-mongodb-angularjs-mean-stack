/**
* Order Routes
*
* @module      :: Order Routes
* @description	:: perform request that related to order management module
*/
var express = require('express');
var router = express.Router();
var orderController = require("../controllers/v1/admin/OrderController");
var checkIn = require("../policies/checkin");
var isAdmin = require("../policies/isAdmin");

//CRUD order, you must check current logged user is admin or not first
router.get('/', [checkIn, isAdmin, orderController.query]);
router.get('/:id', [checkIn, isAdmin, orderController.get]);
router.post('/', [checkIn, isAdmin, orderController.save]);
router.post('/updateLineItems', [checkIn, isAdmin, orderController.updateLineItems]);

router.delete('/:id', [checkIn , isAdmin, orderController.delete]);

module.exports = router;
