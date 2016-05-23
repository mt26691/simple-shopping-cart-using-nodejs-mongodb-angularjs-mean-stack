/**
* @module      :: Article Service
* @description	:: CRUD Article
*/

var model = require('../../models/models')();
var Article = model.Article;
var config = require("../../config/WebConfig");
var helper = require("../HelperService");

module.exports = {
    //query articles
    'query': function(queryData, callback) {
        var skip = 0;
        //item per pages, this is use for pagination
        var itemsPerPage = config.itemsPerPage;
        if (queryData.page != null && !isNaN(queryData.page)) {
            skip = (queryData.page - 1) * itemsPerPage;
        }
        var realQueryData = {};

        if (queryData.keyword && queryData.keyword.length > 0) {
            //find article which name contains queryData.keyword
            realQueryData = {
                $or: [
                    //fint with case insentivie
                    { "name": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } },
                    { "nameUrl": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } }
                ]
            };
        }

        var query = Article
            .find(realQueryData)
            .populate('createdBy', 'name');

        //query builder
        if (queryData.isActive != "" && queryData.isActive != null) {
            query.where('isActive').equals(queryData.isActive);
        }

        //query everything except the field updatedBy and __v
        query.select({ updatedBy: 0, __v: 0 })
            .populate('createdBy', 'name')
            .sort({ updatedAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function(err, articles) {
                if (err) {
                    return callback(err);
                }

                delete query.options;

                query.count().exec(function(err, count) {
                    callback(null, { articles: articles, count: count });
                });
            });
    },
    
    //get article base on id
    'get': function(id, callback) {
        Article
            .findOne( { _id: id })
            //not select createdAt, updatedAt and __v fields
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .exec(function(err, foundArticle) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundArticle);
            });
    },

    //create, update article
    'post': function(article, callback) {
        article.name = article.name.trim();
        article.nameUrl = helper.normalizeChars(article.name);
        //update article
        if (article.id) {
            Article.update({_id: article.id}, article, function(err, saveResult) {
                if (err) {
                    return callback(err);
                }
                    
                return callback(null, true, "Article saved", article);
            });
        }
        //create new article
        else {
            Article.create(article, function(err, savedArticle) {
                if (err) {
                    return callback(err);
                }

                return callback(null, true, "Article created", savedArticle);
            });
        }
    },
    //delete article by its id
    'delete': function(id,  callback) {
        var query = { _id: id };
       
        Article.findOne(query, function(err, foundArticle) {
            foundArticle
                .remove({ _id: id }, function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, true, "Article deleted");
                });
        });
    },
};
