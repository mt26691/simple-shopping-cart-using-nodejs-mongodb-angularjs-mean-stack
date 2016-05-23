/**
* @module      :: Home service
* @description	:: this service is used for getting data for home page, search page and article details
*/
var model = require('../models/models')();
var Article = model.Article;
var Comment = model.Comment;
var config = require("../config/WebConfig");
var User = model.User;
module.exports = {
    //search articles
    search: function(key, page, callback) {
        var skip = 0;
        //items per page
        var itemsPerPage = config.itemsPerPage;

        if (page != null && !isNaN(page)) {
            skip = (page - 1) * itemsPerPage;
        }

        var realQueryData = {};
        //find chapter which name contains queryData.keyword
        if (key != null && key != '') {
            realQueryData =
                {
                    $or: [
                        { "name": { $regex: new RegExp('^.*' + key.toLowerCase() + ".*", 'i') } },
                        { "nameUrl": { $regex: new RegExp('^.*' + key.toLowerCase() + ".*", 'i') } }
                    ]
                };;
        }

        var query = Article.find(realQueryData);
        query.where('isActive').equals(true);
        query
            //query everything except the field below
            .select({ updatedBy: 0, updatedAt: 0, __v: 0 })
            .populate('createdBy', 'name')
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function(err, articles) {
                if (err) {
                    return callback(err);
                }
                //delete query option for couting
                delete query.options;
                //number of articles
                query.count().exec(function(err, total) {
                    callback(null, articles, total);
                });
            });
    },
    //get article based on id
    get: function name(id, callback) {
        Article
            .findOne({ _id: id, isActive: true })
            .populate('createdBy', 'name')
            .exec(function(err, foundArticle) {
                if (err) {
                    return callback(err);
                }
                else {
                    if (foundArticle) {
                        Comment.find({ article: foundArticle.id, isActive: true })
                            .select({ _v: 0, updatedAt: 0, updatedBy: 0 })
                            .populate("createdBy", "name")
                            .exec(function(err, comments) {
                                return callback(null, foundArticle, comments);
                            });
                    }
                    else {
                        return callback(null, null, null);
                    }
                }

            });
    },
    //get recent added article
    //where top 5 newly added article excep current article
    getRecentArticle: function(currentArticleID, callback) {
        Article
            .find({ '_id': { $ne: currentArticleID } })
            .select({ id: 1, name: 1, nameUrl: 1 })
            .sort({ createdAt: 'desc' })
            .skip(5)
            .exec(function(err, articles) {
                if (err) {
                    return callback(err);
                }
                else {
                    return callback(null, articles)
                }
            });
    }

};
