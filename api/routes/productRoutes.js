/**
* Article Routes
*
* @module      :: Product Routes
* @description	:: perform request that related to category management module
*/
var express = require('express');
var router = express.Router();
var productController = require("../controllers/v1/admin/ProductController");
var checkIn = require("../policies/checkin");
var isAdmin = require("../policies/isAdmin");

//CRUD category, you must check current logged user is admin or not first
router.get('/', [checkIn, isAdmin, productController.query]);

router.get('/:id', [checkIn, isAdmin, productController.get]);

router.post('/', [checkIn, isAdmin, productController.save]);

router.delete('/:id', [checkIn, isAdmin, productController.delete]);

module.exports = router;
