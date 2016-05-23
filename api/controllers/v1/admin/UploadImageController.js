/**
* Upload Controller
*
* @module      :: Upload image
* @description	:: CRUD Lecture
*/

var path = require('path');
var fs = require('fs');
var gm = require('gm');
var helperService = require("../../../services/HelperService");
module.exports = {
    'uploadArticleImage': function(req, res) {

        var readStream = fs.createReadStream(req.file.path);

        var realFileName = helperService.getRealFileName(req.file.originalname);

        var resizePathMain = './public/images/main/' + realFileName;
        var resizePathMid = './public/images/mid/' + realFileName;
        var resizePathThumb = './public/images/thumb/' + realFileName;

        gm(readStream, req.file.originalname)
            .resize(800)
            .noProfile()
            .stream(function(err, stdout, stderr) {
                var writeStream = fs.createWriteStream(resizePathMain);
                stdout.pipe(writeStream);
            });

        gm(readStream, req.file.originalname)
            .resize(640)
            .noProfile()
            .stream(function(err, stdout, stderr) {
                var writeStream = fs.createWriteStream(resizePathMid);
                stdout.pipe(writeStream);
            });

        gm(readStream, req.file.originalname)
            .resize(400)
            .noProfile()
            .stream(function(err, stdout, stderr) {
                var writeStream = fs.createWriteStream(resizePathThumb);
                stdout.pipe(writeStream);
            });

        //remove temp file
        fs.unlinkSync(req.file.path);

        res.status(200).json({ err: true, fileName: realFileName });
    },
    'uploadImage': function(req, res) {
        var readStream = fs.createReadStream(req.file.path);

        var realFileName = helperService.getRealFileName(req.file.originalname);
        var folder = helperService.getUploadFolder();
        var fullFolder = "./public/images/article/" + folder;
        if (!fs.existsSync(fullFolder)) {
            fs.mkdirSync(fullFolder);
        }

        var imagePath = fullFolder + "/" + realFileName;
        var urlPath = '/images/article/' + folder + "/" + realFileName;
        //create new image
        readStream.pipe(fs.createWriteStream(imagePath));

        //remove temp file
        fs.unlinkSync(req.file.path);
        
        //return html back to ckeditor callback function
        var html = "";
        html += "<script type='text/javascript'>";
        html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
        html += "    var url     = \"" + urlPath + "\";";
        html += "";
        html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url);";
        html += "</script>";

        res.send(html);

    }
};

