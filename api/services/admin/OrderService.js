/**
* @module      :: Order Service
* @description	:: CRUD Order
*/

var model = require('../../models/models')();
var Order = model.Order;
var Product = model.Product;
var config = require("../../config/WebConfig");
var helper = require("../HelperService");
var productService = require("./productService");

var self = {
    //query orders
    'query': function (queryData, callback) {
        var skip = 0;
        //item per pages, this is use for pagination
        var itemsPerPage = config.itemsPerPage;

        if (queryData.page != null && !isNaN(queryData.page)) {
            skip = (queryData.page - 1) * itemsPerPage;
        }

        var realQueryData = {};

        if (queryData.keyword && queryData.keyword.length > 0) {
            //find order which name contains queryData.keyword
            realQueryData = {
                $or: [
                    //find   with case insentivie
                    { "shippingAddress.receiver": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } },
                    { "shippingAddress.street": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } }
                ]
            };
        }

        //if query data is a number greater than 0
        if (!isNaN(queryData.keyword) && queryData > 0) {
            query.where('subTotal').gt(queryData.keyword);
        }

        var query = Order
            .find(realQueryData)
            .populate('createdBy', 'name');

        //query everything except the field updatedBy and __v
        query.select({ updatedBy: 0, __v: 0 })
            .populate('createdBy', 'name')
            .populate('lineItems.product', 'id name slug')
            .sort({ updatedAt: 'desc' })
            .skip(skip)
            .limit(itemsPerPage)
            .exec(function (err, orders) {
                if (err) {
                    return callback(err);
                }

                delete query.options;

                query.count().exec(function (err, count) {
                    callback(null, { orders: orders, count: count });
                });
            });
    },


    //get order base on id
    'get': function (id, callback) {
        Order
            .findOne({ _id: id })
            //not select createdAt, updatedAt and __v fields
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .populate('lineItems.product', 'name slug')
            .exec(function (err, foundOrder) {
                if (err) {
                    return callback(err);
                }
                return callback(null, foundOrder);
            });
    },

    //create, update order
    'save': function (order, productList, callback) {
        productService.calculatePrice(productList, function (returnProductList, subTotal) {
            //update order
            if (order.id) {
                Order
                    .findOne({ _id: order.id })
                    .exec(function (err, foundOrder) {
                        if (err) {
                            return callback(err);
                        }
                        if (!foundOrder) {
                            return callback(null, false, "Order not found", null);
                        }
                        //add pricing history
                        if (foundOrder.pricing.retail != order.pricing.retail
                            || foundOrder.pricing.sale != order.pricing.sale
                            || foundOrder.pricing.stock != order.pricing.stock) {
                            foundOrder.priceHistory.push(foundOrder.pricing);
                        }

                        foundOrder = Object.assign(foundOrder, order);

                        foundOrder.save(function (err, savedResult) {
                            if (err) {
                                return callback(err);
                            }

                            return callback(null, true, "Order saved", foundOrder);
                        });
                    });
            }
            //create new order
            else {
                order.lineItems = returnProductList;
                order.subTotal = subTotal;
                console.log(order);
                
                Order.create(order, function (err, savedOrder) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, true, "Order created", savedOrder);
                });
            }
        });
    },
    //delete order by its id
    'delete': function (id, callback) {
        var query = { _id: id };
        //only brand new order can be deleted (no order contains order)
        Order.findOne(query, function (err, foundOrder) {
            if (err) {
                return callback(err);
            }

            if (!foundOrder) {
                return callback(null, false, "Order not found");
            }

            foundOrder
                .remove({ _id: id }, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, true, "Order deleted");
                });
        });
    }
};

module.exports = self;