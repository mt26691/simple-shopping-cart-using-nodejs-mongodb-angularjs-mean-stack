/**
* @module      :: Product Service
* @description	:: CRUD Product
*/

var model = require('../../models/models')();
var Category = model.Category;
var Product = model.Product;
var config = require("../../config/WebConfig");
var helper = require("../HelperService");
var _ = require("lodash");

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

        var query = Product
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
        Product
            .findOne({ _id: id })
            //not select createdAt, updatedAt and __v fields
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .populate('primary_category', 'name slug')
            .exec(function (err, foundProduct) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundProduct);
            });
    },

    //create, update product
    'save': function (product, callback) {
        product.name = product.name.trim();
        product.slug = helper.normalizeChars(product.name);

        //update product
        if (product.id) {
            Product
                .findOne({ _id: product.id })
                .exec(function (err, foundProduct) {
                    if (err) {
                        return callback(err);
                    }
                    if (!foundProduct) {
                        return callback(null, false, "Product not found", null);
                    }
                    //add pricing history
                    if (foundProduct.pricing.retail != product.pricing.retail
                        || foundProduct.pricing.sale != product.pricing.sale
                        || foundProduct.pricing.stock != product.pricing.stock) {
                        foundProduct.priceHistory.push(foundProduct.pricing);
                    }

                    foundProduct = Object.assign(foundProduct, product);

                    foundProduct.save(function (err, savedResult) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, true, "Product saved", foundProduct);
                    });
                });
        }
        //create new product
        else {
            Product.create(product, function (err, savedProduct) {
                if (err) {
                    return callback(err);
                }

                return callback(null, true, "Product created", savedProduct);
            });
        }
    },
    //delete product by its id
    'delete': function (id, callback) {
        var query = { _id: id };
        //only brand new product can be deleted (no order contains product)
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
    },
    'calculatePrice': function (productList, callback) {
        /*
        productList : [{
              productId:ObjectId,
              quantity:Number
        }];
        */
        var returnProductList = [];
        var subTotal = 0;
        var productIdList = _.map(productList, "id");

        Product
            .find({ _id: { $in: productIdList } })
            .select({ name: 1, slug: 1, pricing: 1 })
            .exec(function (err, foundProducts) {
                foundProducts.forEach(function (product) {
                    var quantity = _(productList)
                        .filter(c => c.id == product.id)
                        .map(c => c.quantity)
                        .value()[0];
                    
                    //return product
                    var returnProduct = {
                        product: product._id,
                        quantity: quantity,
                        pricing: product.pricing.retail
                    }

                    //if product is on sale, we use sale price to calculate price
                    if (product.pricing.sale && product.pricing.sale > 0) {
                        returnProduct.pricing = product.pricing.sale;
                    }
                    subTotal += returnProduct.pricing * quantity;
                    returnProductList.push(returnProduct);
                });
                callback(returnProductList, subTotal);
            });
    }
};

module.exports = self;