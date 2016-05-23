var mongoose = require('mongoose');

//models
module.exports = function() {

    var User =
        mongoose.model('User', require('./user'), 'User');

    var Article =
        mongoose.model('Article', require('./article'), 'Article');

    var AccessToken =
        mongoose.model('AccessToken', require('./accessToken'), 'AccessToken');

    var Comment =
        mongoose.model('Comment', require('./comment'), 'Comment');

    var models = {
        User: User,
        AccessToken: AccessToken,
        Article: Article,
        Comment: Comment
    };

    return models;
};
