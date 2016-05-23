var mongoose = require('mongoose');

//models
module.exports = function () {

    var User =
        mongoose.model('User', require('./user'), 'User');

    var Article =
        mongoose.model('Article', require('./article'), 'Article');

    var AccessToken =
        mongoose.model('AccessToken', require('./accessToken'), 'AccessToken');

    var Comment =
        mongoose.model('Comment', require('./comment'), 'Comment');

    var Price = mongoose.model('Price', require('./price'), 'Price');

    var Product = mongoose.model('Product', require('./product'), 'Product');

    var Category = mongoose.model('Category', require('./category'), 'Category');

    var Order = mongoose.model('Order', require('./order'), 'Order');

    var models = {
        User: User,
        AccessToken: AccessToken,
        Article: Article,
        Comment: Comment,
        Price: Price,
        Product: Product,
        Category: Category,
        Order: Order
    };

    return models;
};
