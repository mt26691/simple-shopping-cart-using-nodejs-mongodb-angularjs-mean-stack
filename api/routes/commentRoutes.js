/**
* Comment Routes
*
* @module      :: Comment Routes
* @description	:: perform request that related to comment
*/

var express = require('express');
var router = express.Router();
var commentController = require("../controllers/v1/admin/CommentController");
var checkIn = require("../policies/checkin");
var isAuthenticated = require("../policies/isAuthenticated");
var isAdmin = require("../policies/isAdmin");

//CRUD article, you must check current logged user is admin or not first
router.get('/', [checkIn, isAdmin, commentController.query]);
router.get('/:id', [checkIn, isAdmin, commentController.get]);

//normal user can create comment, so we do not check whether they are admin or not,
// just check whether they are logged in or not
router.post('/', [checkIn, isAuthenticated, commentController.post]);
router.delete('/:id', [checkIn, isAdmin, commentController.delete]);

module.exports = router;
