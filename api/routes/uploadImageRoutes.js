/**
* Upload Image Route
*
* @module      :: Upload Image Routes
* @description	:: upload file route
*/

var express = require('express');
var router = express.Router();
var uploadImageController = require("../controllers/v1/admin/UploadImageController");
var checkIn = require("../policies/checkin");
var isAdmin = require("../policies/isAdmin");

//we use multer module for upload file
//firstly we must store files or images in a temporary folder
//secondly we redirect the request to right controller to process file
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('userPhoto');

var lectureUpload = multer({ storage: storage }).single('upload');

router.post('/uploadArticleImage', [checkIn, isAdmin, upload, uploadImageController.uploadArticleImage]);

router.post('/uploadImage', [checkIn, isAdmin, lectureUpload, uploadImageController.uploadImage]);
module.exports = router;
