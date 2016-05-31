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


router.get("/", homeController.queryProducts);
router.get("/searchProducts", homeController.searchProducts);
router.get("/:id", homeController.getProduct);

// //blog home page, :page stand for the page user wish to see
// router.get("/blogs", homeController.getBlog);


// //get artcile details
// router.get("/blog/:nameUrl/:id", homeController.getBlog);

module.exports = router;
