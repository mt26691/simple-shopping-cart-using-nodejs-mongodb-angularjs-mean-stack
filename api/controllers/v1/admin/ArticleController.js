/**
* Article Controller
*
* @module      :: Article Controller
* @description	:: CRUD Article for blog
*/

//load article services
var articleService = require("../../../services/admin/ArticleService");
module.exports = {
    //query article in database, pagination supported
    'query': function(req, res) {
        //get current page
        var page = req.query.page == null ? 1 : req.query.page;
        //search key word
        var keyword = req.query.keyword == null ? "" : req.query.keyword;
        var queryData = { keyword: keyword, page: page, isActive: req.query.isActive };

        articleService.query(queryData, function(err, data) {
            if (err) {
                res.status(500).json({ err: true, msg: "server error" });
            }
            else {
                //data contains data (list of articles) and number of articles
                res.status(200).json({ data: data.articles, count: data.count });
            }
        });
    },

    //ger article base on id
    'get': function(req, res) {
        //get article id from req params.
        //we can do this because of routing setting in /api/routes/articleRoutes.js
        var id = req.params.id;

        if (id != null) {
            articleService.get(id, function(err, foundArticle) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "Server error" });
                }
                if (!foundArticle) {
                    return res.status(200).json({ err: true, msg: "Article not found" });
                }
                //return article info to client
                return res.status(200).json(foundArticle);
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "Id not found" });
        }
    },
    
    //create, update article
    'post': function(req, res) {
        var postData = req.body;
        //article data
        var item = {
            id: postData.id,
            name: postData.name,
            description: postData.description,
            isActive: postData.isActive,
            inActiveReason: postData.inActiveReason,
            level: postData.level,
            duration: postData.duration,
            image: postData.image,
            content: postData.content
        };
        
        if (item.id == null) {
            item.createdBy = req.user.id;
        }

        item.updatedBy = req.user.id;
        //check required field
        if (!item.name || !item.description || item.isActive == null) {
            return res.status(200).json({ err: true, msg: "missing some field" });
        }

        //create update article
        articleService.post(item, function(err, result, msg, data) {
            if (err) {
                //return error back to client
                return res.status(500).json({ err: true, msg: "Server error in ArticleController/post" });
            }
            if (!result) {
                return res.status(200).json({ err: true, msg: msg });
            }
            return res.status(200).json({ err: !result, msg: msg, data: data });
        });

    },
    
    //delete article
    'delete': function(req, res) {
        var id = req.params.id;

        if (id == null) {
            return res.status(200).json({ err: true, msg: "Article id is missing" });
        }

        articleService.delete(id, function(err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error in ArticleController/delete" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });
    },
};

