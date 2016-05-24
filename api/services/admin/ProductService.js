/**
* @module      :: Product Service
* @description	:: CRUD Product
*/

var model = require('../../models/models')();
var Category = model.Category;
var Product = model.Product;
var config = require("../../config/WebConfig");
var helper = require("../HelperService");


var self = {
    //query products
    'query': function (queryData, callback) {
        var skip = 0;
        //item per pages, this is use for pagination
        var itemsPerPage = config.itemsPerPage;

        if (queryData.page != null && !isNaN(queryData.page)) {
            skip = (queryData.page - 1) * itemsPerPage;
        }

        var realQueryData = {};

        if (queryData.keyword && queryData.keyword.length > 0) {
            //find product which name contains queryData.keyword
            realQueryData = {
                $or: [
                    //fint with case insentivie
                    { "name": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } },
                    { "slug": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } }
                ]
            };
        }

        //query builder
        if (queryData.isActive != "" && queryData.isActive != null) {
            query.where('isActive').equals(queryData.isActive);
        }

        var query = Category
            .find(realQueryData)
            .populate('createdBy', 'name');

        //query everything except the field updatedBy and __v
        query.select({ updatedBy: 0, __v: 0 })
            .populate('createdBy', 'name')
            .populate('primary_category', 'name slug')
            .sort({ updatedAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function (err, products) {
                if (err) {
                    return callback(err);
                }

                delete query.options;

                query.count().exec(function (err, count) {
                    callback(null, { products: products, count: count });
                });
            });
    },


    //get product base on id
    'get': function (id, callback) {
        Category
            .findOne({ _id: id })
            //not select createdAt, updatedAt and __v fields
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .populate('primary_category', 'name slug')
            .exec(function (err, foundCategory) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundCategory);
            });
    },

    //create, update product
    'save': function (product, callback) {
        product.name = product.name.trim();
        product.slug = helper.normalizeChars(product.name);

        //update product
        if (product.id) {
            Category.update({ _id: product.id }, product, function (err, saveResult) {
                if (err) {
                    return callback(err);
                }

                return callback(null, true, "Category saved", product);
            });
        }
        //create new product
        else {
            Category.create(product, function (err, savedCategory) {
                if (err) {
                    return callback(err);
                }

                return callback(null, true, "Category created", savedCategory);
            });
        }
    },
    //delete product by its id
    'delete': function (id, callback) {
        var query = { _id: id };

        Product.findOne(query, function (err, foundProduct) {
            if (err) {
                return callback(err);
            }

            if (!foundProduct) {
                return callback(null, false, "Product not found");
            }

            foundProduct
                .remove({ _id: id }, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, true, "Product deleted");
                });
        });
    }
};

module.exports = self;