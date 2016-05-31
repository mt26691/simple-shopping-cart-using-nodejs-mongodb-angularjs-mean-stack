/**
* @module      :: Category Service
* @description	:: CRUD Category
*/

var model = require('../../models/models')();
var Category = model.Category;
var Product = model.Product;
var config = require("../../config/WebConfig");
var helper = require("../HelperService");


var self = {
    //query categories
    'query': function (queryData, callback) {
        var skip = 0;
        //item per pages, this is use for pagination
        var itemsPerPage = config.itemsPerPage;

        if (queryData.page != null && !isNaN(queryData.page)) {
            skip = (queryData.page - 1) * itemsPerPage;
        }

        var realQueryData = {};

        if (queryData.keyword && queryData.keyword.length > 0) {
            //find category which name contains queryData.keyword
            realQueryData = {
                $or: [
                    //fint with case insentivie
                    { "name": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } },
                    { "slug": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } },
                    { "description": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } }
                ]
            };
        }

        var query = Category
            .find(realQueryData)
            .populate('createdBy', 'name');

        //query everything except the field updatedBy and __v
        query.select({ updatedBy: 0, __v: 0 })
            .populate('createdBy', 'name')
            .populate('parent', 'name slug')
            .sort({ updatedAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function (err, categories) {
                if (err) {
                    return callback(err);
                }

                delete query.options;

                query.count().exec(function (err, count) {
                    callback(null, { categories: categories, count: count });
                });
            });
    },


    //get category base on id
    'get': function (id, callback) {
        Category
            .findOne({ _id: id })
            //not select createdAt, updatedAt and __v fields
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .populate('parent', 'name slug')
            .populate('ancestors', 'name slug')
            .exec(function (err, foundCategory) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundCategory);
            });
    },

    //create, update category
    'save': function (category, callback) {
        category.name = category.name.trim();
        category.slug = helper.normalizeChars(category.name);

        //update category
        if (category.id) {
            Category.update({ _id: category.id }, category, function (err, saveResult) {
                if (err) {
                    return callback(err);
                }

                return callback(null, true, "Category saved", category);
            });
        }
        //create new category
        else {
            Category.create(category, function (err, savedCategory) {
                if (err) {
                    return callback(err);
                }

                return callback(null, true, "Category created", savedCategory);
            });
        }
    },
    //delete category by its id
    'delete': function (id, callback) {
        var query = { _id: id };

        Category.findOne(query, function (err, foundCategory) {
            if (err) {
                return callback(err);
            }

            if (!foundCategory) {
                return callback(null, false, "Category not found");
            }

            //check for product
            Product
                .findOne({ primaryCategory: id })
                .select({ id: 1 })
                .exec(function (err, product) {
                    
                    if (product != null) {
                        return callback(null, false, "There are products in this category");
                    }

                    //check for descentdants
                    self.findParentCategory(id, function (parentCategory) {
                        if (parentCategory) {
                            return callback(null, false, "This category has decendants");
                        }

                        foundCategory
                            .remove({ _id: id }, function (err, result) {
                                if (err) {
                                    return callback(err);
                                }
                                return callback(null, true, "Category deleted");
                            });
                    });
                });
        });
    },
    'findParentCategory': function (currentCategoryId, callback) {
        Category
            .findOne({ parent: currentCategoryId })
            .select({ name: 1, slug: 1 })
            .exec(function (err, foundCategory) {
                callback(foundCategory);
            });
    }
};

module.exports = self;