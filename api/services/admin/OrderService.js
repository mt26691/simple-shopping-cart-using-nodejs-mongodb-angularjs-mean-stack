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
var uuid = require("node-uuid");

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
                    { "orderInfo.receiver": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } },
                    { "orderInfo.street": { $regex: new RegExp('^.*' + queryData.keyword.toLowerCase() + ".*", 'i') } }
                ]
            };
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
                return callback(err, foundOrder);
            });
    },
    //only  get order which was checkout by anonymous
    'getByTrackingCode': function (trackingCode, callback) {
        Order
            .findOne({ trackingCode: trackingCode, createdBy: null })
            //not select createdAt, updatedAt and __v fields
            .select({ createdAt: 0, updatedAt: 0, __v: 0 })
            .populate('lineItems.product', 'name slug')
            .exec(function (err, foundOrder) {
                return callback(err, foundOrder);
            });
    },
    'migrateCart': function (currentUser, orderId) {
        self.getCurrentOrder(currentUser, null, "cart", function (err, foundOrder) {
            Order
                .findOne({ _id: orderId })
                .exec(function (err, currentOrder) {
                    if (foundOrder) {
                        for (var i = 0; i < foundOrder.lineItems; i++) {
                            for (var j = 0; j < currentOrder.lineItems; j++) {
                                if (foundOrder.lineItems[i]._id == currentOrder.lineItems[i]._id) {
                                    foundOrder.lineItems[i].quantity = currentOrder.lineItems[i].quantity;
                                }
                            }
                        }
                    }
                    else {
                        currentOrder.createdBy = currentUser.id;
                        currentOrder.updatedBy = currentUser.id;
                        currentOrder.save();
                    }
                });

        });
    },
    'getCurrentOrder': function (currentUser, orderId, state, callback) {
        if (currentUser) {
            Order
                .findOne({ createdBy: currentUser.id, state: state })
                .exec(function (err, foundOrder) {
                    return callback(err, foundOrder);
                });
        }
        else {
            Order
                .findOne({ createdBy: null, _id: orderId, state: state })
                .exec(function (err, foundOrder) {
                    if (err) {
                        return callback(err);
                    }
                    if (!foundOrder) {
                        return callback(null, null);
                    }
                    return callback(null, foundOrder);
                });
        }

    },
    'getAllOrders': function (userId, callback) {
        Order
            .find({ createdBy: userId })
            .exec(function (err, foundOrders) {
                return callback(err, foundOrders);
            });
    },
    //create, update order
    'save': function (order, callback) {
        //update order
        self.updateLineItems(order.lineItems, function (returnProductList) {
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
                        foundOrder.orderInfo = order.orderInfo;
                        //only update line items when order state == cart or checkout

                        if (order.state == "cart" || order.state == "checkout") {
                            foundOrder.lineItems = returnProductList;
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

                Order.create(order, function (err, savedOrder) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, true, "Order created", savedOrder);
                });

            }
        });
    },
    'checkout': function (currentUser, orderId, orderInfo, callback) {
        
        self.getCurrentOrder(currentUser, orderId, "cart", function (err, foundOrder) {
            if (err) {
                return callback(err);
            }
            if (!foundOrder) {
                return callback(err, false, "Order not found");
            }
            
            self.updateLineItems(foundOrder.lineItems, function (returnLineItems) {
                foundOrder.orderInfo = orderInfo;
                foundOrder.state = "checkout";
                foundOrder.lineItems = returnLineItems;
                if (!currentUser && orderId) {
                    //create trackingCode for order if this is order is checked out by anonymous userId
                    foundOrder.trackingCode = uuid.v4();
                }
                
                foundOrder.save();
                return callback(null, true, "order is checkout", foundOrder);
            });

        });
    }
    ,
    'addToCart': function (currentUser, cartId, product, quantity, callback) {
        //find product first, if not found, reject
        productService.get(product, function (err, foundProduct) {
            if (foundProduct) {
                var currentPrice = productService.getCurrentProductPrice(foundProduct);

                //find current cart
                self.getCurrentOrder(currentUser, cartId, "cart", function (err, foundOrder) {
                    if (foundOrder) {
                        if (quantity == 0) {
                            // removed product if quantity = 0;
                            var updatedLineItems = _(foundOrder.lineItems)
                                .filter(c => c.product != product).value();
                            foundOrder.lineItems = updatedLineItems;
                            foundOrder.save();
                            return callback(null, true, "Order updated, product removed sucessfully", foundOrder);
                        }
                        else {
                            var isExistProduct = false;

                            for (var i = 0; i < foundOrder.lineItems.length; i++) {
                                var currentProduct = foundOrder.lineItems[i];
                                if (currentProduct.product == product) {
                                    currentProduct.product.pricing = currentPrice;
                                    currentProduct.product.quantity = quantity;
                                    isExistProduct = true;
                                    break;
                                }
                            }
                            if (!isExistProduct) {
                                foundOrder.lineItems.push({
                                    product: product,
                                    quantity: quantity,
                                    pricing: currentPrice
                                });
                            }
                            foundOrder.save();
                            return callback(null, true, "Order updated, product added sucessfully", foundOrder);

                        }
                    }
                    else {
                        if (quantity == 0) {
                            return callback(null, false, "Can't not add product with quantity = 0");
                        }
                        var order = {
                            state: "cart",
                            createdBy: currentUser != null ? currentUser.id : null,
                            updatedBy: currentUser != null ? currentUser.id : null,
                            lineItems: [{
                                product: product,
                                quantity: quantity,
                                pricing: currentPrice
                            }]

                        };
                        //Create order;
                        Order.create(order, function (err, createdOrder) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, true, "Order created", createdOrder);
                        });

                    }
                });
            }
            else {
                return callback(null, false, "Product not found");
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

                    //if quantity == 0, remove product
                    if (isNaN(quantity) || quantity == null || quantity == 0) {
                        return true;
                    }
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
                    returnProductList.push(returnProduct);
                });

                callback(returnProductList);
            });
    },
    updateLineItemsManually: function (orderId, callback) {
        Order
            .findOne({ _id: orderId })
            .select({ createdAt: 0, updatedAt: 0, __v: 0, orderInfo: 0 })
            .exec(function (err, foundOrder) {
                if (err || !foundOrder) {
                    return callback(err, false, "Order not found");
                }

                self.updateLineItems(foundOrder.lineItems, function (returnProductList) {
                    foundOrder.lineItems = returnProductList;
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