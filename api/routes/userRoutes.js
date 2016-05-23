/**
* User route
*
* @module      :: User route
* @description	:: CRUD user
*/

var express = require('express');
var router = express.Router();
var useController = require("../controllers/v1/admin/UserController");
var checkIn = require("../policies/checkin");
var isAdmin = require("../policies/isAdmin");

//query user with pagignation
router.get('/', [checkIn, isAdmin, useController.query]);
//get user
router.get('/:id', [checkIn, isAdmin, useController.get]);
//create edit user
router.post('/', [checkIn, isAdmin, useController.post]);
//delete user
router.delete('/:id', [checkIn , isAdmin, useController.delete]);

module.exports = router;
