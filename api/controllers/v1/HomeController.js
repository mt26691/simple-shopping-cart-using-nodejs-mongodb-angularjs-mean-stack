/**
* Home Controller
* @module      :: Home Controller, search, query articles and get article details
*/

var homeService = require("../../services/HomeService");
module.exports = {
    //get home page data, articles and total number of articles for pagination
    'search': function (req, res) {
        var key = req.query.key;
        var page = req.query.page;
        //search article based on keyword and page
        homeService.search(key, page, function (err, articles, total) {
            if (err) {
                return res.status(500);
            }

            return res.status(200).json({ err: false, articles: articles, total: total });
        });
    },

    //get article details
    'get': function (req, res) {
        var nameUrl = req.params.nameUrl;
        var id = req.params.id;
        //return 404 if in the request does not contains nameUrl and id
        if (nameUrl == null || id == null) {
            return res.status(404);
        }
        homeService.get(id, function (err, article, comments) {
            if (err) {
                return res.status(500);
            }
            if (article != null) {
                //get recent articles
                homeService.getRecentArticle(id, function callback(err, articles) {
                    if (err) {
                        return res.status(500);
                    }
                    return res.status(200).json({ err: false, article: article, recentArticles: articles, comments: comments });
                });
            }
            else {
                return res.status(200).json({ err: false, article: null, recentArticles: null });
            }

        });
    }
};
