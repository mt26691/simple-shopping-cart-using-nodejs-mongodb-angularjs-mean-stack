/**
* Home Routes
*
* @module      :: Home Routes
* @description	:: perform request that related to home page, the things that anonymous users see
*/

var express = require('express');
var router = express.Router();
var homeController = require("../controllers/v1/HomeController");
var checkIn = require("../policies/checkin");

//blog home page, :page stand for the page user wish to see
router.get("/", homeController.search);

//get artcile details
router.get("/:nameUrl/:id", homeController.get);

module.exports = router;
