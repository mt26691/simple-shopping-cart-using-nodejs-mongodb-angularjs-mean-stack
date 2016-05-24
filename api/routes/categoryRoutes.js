/**
* Article Routes
*
* @module      :: Category Routes
* @description	:: perform request that related to category management module
*/
var express = require('express');
var router = express.Router();
var categoryController = require("../controllers/v1/admin/CategoryController");
var checkIn = require("../policies/checkin");
var isAdmin = require("../policies/isAdmin");

//CRUD category, you must check current logged user is admin or not first
router.get('/', [checkIn, isAdmin, categoryController.query]);

router.get('/:id', [checkIn, isAdmin, categoryController.get]);

router.post('/', [checkIn, isAdmin, categoryController.save]);

router.delete('/:id', [checkIn, isAdmin, categoryController.delete]);

module.exports = router;
