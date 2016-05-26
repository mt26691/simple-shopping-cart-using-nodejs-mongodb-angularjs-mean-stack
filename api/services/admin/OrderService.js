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
var _ = require("lodash");

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
    'save': function (order, callback) {
        //update order
        self.updateLineItems(order.lineItems, function (returnProductList, subTotal) {
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

                        foundOrder.state = order.state;
                        foundOrder.shippingAddress = order.shippingAddress;
                        //only update line items when order state == cart or checkout

                        if (order.state == "cart" || order.state == "checkout") {
                            foundOrder.lineItems = returnProductList;
                            foundOrder.subTotal = subTotal;
                            foundOrder.save();
                            return callback(null, true, "Order saved", foundOrder);
                        }
                        else {
                            foundOrder.save();
                            return callback(null, true, "Order saved", foundOrder);
                        }
                    });
            }
            //create new order
            else {
                //update line items
                order.lineItems = returnProductList;
                order.subTotal = subTotal;

                Order.create(order, function (err, savedOrder) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, true, "Order created", savedOrder);
                });

            }
        });
    },
    updateLineItems: function (productList, callback) {
        /*
            productList : [{
            productId:ObjectId,
            quantity:Number
            }];
        */

        var returnProductList = [];
        var subTotal = 0;
        var productIdList = _.map(productList, "product");

        Product
            .find({ _id: { $in: productIdList } })
            .select({ name: 1, slug: 1, pricing: 1 })
            .exec(function (err, foundProducts) {
                foundProducts.forEach(function (currentProduct) {
                    var quantity = _(productList)
                        .filter(c => c.product == currentProduct.id)
                        .map(c => c.quantity)
                        .value()[0];

                    //return product
                    var returnProduct = {
                        product: currentProduct.id,
                        quantity: quantity,
                        pricing: currentProduct.pricing.retail
                    }

                    //if product is on sale, we use sale price to calculate price
                    if (currentProduct.pricing.currentProduct && product.pricing.sale > 0) {
                        returnProduct.pricing = currentProduct.pricing.sale;
                    }
                    subTotal += returnProduct.pricing * quantity;
                    returnProductList.push(returnProduct);
                });

                callback(returnProductList, subTotal);
            });
    },
    updateLineItemsManually: function (orderId, callback) {
        Order
            .findOne({ _id: orderId })
            .select({ createdAt: 0, updatedAt: 0, __v: 0 , shippingAddress:0})
            .exec(function (err, foundOrder) {
                if (err) {
                    return callback(err);
                }
                if (!foundOrder) {
                    return callback(null, false, "Order not found");
                }
               
                self.updateLineItems(foundOrder.lineItems, function (returnProductList, subTotal) {
                    foundOrder.lineItems = returnProductList;
                    foundOrder.subTotal = subTotal;
                    foundOrder.save();
                    return callback(null, true, "Order saved", foundOrder);
                });
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
            //we can delete order state = cart or cancel only
            if (foundOrder.state == "cart" || foundOrder.state == "cancel") {
                foundOrder
                    .remove({ _id: id }, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, true, "Order deleted");
                    });
            }
            else {
                return callback(null, false, "Can not delete this order");
            }

        });
    }
};

module.exports = self;