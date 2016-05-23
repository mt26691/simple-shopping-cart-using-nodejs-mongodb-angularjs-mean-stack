/**
* @module      :: Comment Service
* @description	:: CRUD Comment
*/

var model = require('../../models/models')();
var Article = model.Article;
var Comment = model.Comment;

var config = require("../../config/WebConfig");
var helper = require("../HelperService");
var Subject = model.Subject;

module.exports = {
    //query comment
    'query': function(queryData, callback) {
        var skip = 0;
        //items per page
        var itemsPerPage = config.itemsPerPage;
        if (queryData.page != null && !isNaN(queryData.page)) {
            skip = (queryData.page - 1) * itemsPerPage;
        }
        var realQueryData = {};
        if (queryData.keyword && queryData.keyword.length > 0) {
            //find comment which content contains queryData.keyword
            realQueryData = { "content": { $regex: ".*" + queryData.keyword + ".*" } };
        }

        var query = Comment.find(realQueryData);

        //query builder for is Active field
        if (queryData.isActive != null && queryData.isActive != '') {
            query.where('isActive').equals(queryData.isActive);
        }

        query
            //query everything except the field below
            .select({ updatedBy: 0, __v: 0 })
            .populate('article', 'name nameUrl')
            .populate('createdBy', 'name email')
            .sort({ createdAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function(err, comments) {
                if (err) {
                    return callback(err);
                }
                delete query.options;
                query.count().exec(function(err, count) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, { comments: comments, count: count });
                });
            });
    },

    //get comment based on id
    'get': function(id, callback) {
        Comment
            .findOne({ _id: id })
            .populate('article', 'name')
            .select({ updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 })
            .exec(function(err, foundLecture) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundLecture);
            });
    },

    //create, update comment
    'post': function(comment, user, callback) {
        //update case
        if (comment.id) {
            if (user.role != 'admin') {
                return callback(null, false, "You do not have permission to update comment");
            }
            Comment.findOne({ _id: comment.id }, function(err, foundComment) {
                if (err || !foundComment) {
                    return callback(null, false, "comment can not be found");
                }

                foundComment.content = comment.content;
                foundComment.isActive = comment.isActive;
                foundComment.inActiveReason = comment.inActiveReason;

                foundComment.save(function(err, result) {
                    if (err) {
                        return callback(null, false, "Error while updating new comment");
                    }

                    return callback(null, true, "Comment is updated", result);
                });
            });
        }
        //create
        else {
            Article.findOne({ _id: comment.article }, function(err, foundArticle) {
                if (err || !foundArticle) {
                    return callback(null, false, "foundArticle can not be found");
                }
                Comment.create(comment, function(err, savedComment) {
                    if (err) {
                        return callback(null, false, "error while creating new comment");
                    }
                    
                    return callback(null, true, "Comment saved", savedComment);
                });
            });
        }
    },
    
    //delete comment by id
    'delete': function(id, callback) {
        Comment.findOne({ _id: id }, function(err, foundComment) {
            if (err) {
                return callback(err);
            }

            Comment.remove({ _id: id }, function(err, result) {
                if (err) {
                    return callback(err);
                }
                if (result.result.ok) {
                    return callback(null, true, "Comment Deleted");
                }
                else {
                    return callback(null, false, "Error while deleting comment");
                }
            });

        });

    }

};
