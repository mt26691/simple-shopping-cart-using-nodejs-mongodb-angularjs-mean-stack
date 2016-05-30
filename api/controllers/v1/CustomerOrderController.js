/**
* Order Controller
*
* @module      :: Order Controller
* @description	:: CRUD Order for blog
*/

//load order services
var orderService = require("../../services/admin/OrderService");

module.exports = {
    //query order in database, pagination supported
    'query': function (req, res) {
        //get current page
        var page = req.query.page == null ? 1 : req.query.page;
        //search key word
        var keyword = req.query.keyword == null ? "" : req.query.keyword;
        var queryData = { keyword: keyword, page: page, isActive: req.query.isActive };

        orderService.query(queryData, function (err, data) {
            if (err) {
                res.status(500).json({ err: true, msg: "server error" });
            }
            else {
                //data contains data (list of orders) and number of orders
                res.status(200).json({ data: data.orders, count: data.count });
            }
        });
    },

    //ger order base on id
    'get': function (req, res) {
        //get order id from req params.
        //we can do this because of routing setting in /api/routes/orderRoutes.js
        var id = req.params.id;

        if (id != null) {
            orderService.get(id, function (err, foundOrder) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "Server error" });
                }
                if (!foundOrder) {
                    return res.status(200).json({ err: true, msg: "Order not found" });
                }
                //return order info to client
                return res.status(200).json(foundOrder);
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "Id not found" });
        }
    },
    //create, update order
    'addToCart': function (req, res) {
        var postData = req.body;
        var user = req.user;
        var cartId = null;

        if (!user) {
            if (req.cookies.orderId) {
                cartId = req.cookies.order.orderId;
            }
        }

        if (!postData.product) {
            return res.status(500).json({ err: true, msg: "Product not found" });
        }
        //if quantity is not a number of < 0 set it to 1
        if (isNaN(postData.quantity) || postData.quantity < 0) {
            postData.quantity = 1;
        }

        orderService.addToCart(req.user, cartId, postData.product, postData.quantity, function (err, result, msg, order) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error in adding to cart" });
            }
            if (!result) {
                return res.status(200).json({ err: true, msg: msg });
            }
            if (!req.user) {
                var expiresTime = 60 * 60 * 1000 * 14;
                res.cookie("order", { orderId: order.id }, { expires: new Date(Date.now() + expiresTime), httpOnly: true });
            }

            return res.status(200).json({ err: false, msg: "Current Cart", cart: order });
        });
    },
    'migrateCart': function (req, res) {
        if (req.user && req.cookies.order != null) {
            var orderId = req.cookies.order.orderId;
            orderService.migrateCart(req.user, orderId);
            //migrate cart
            var expiresTime = 60 * 60 * 1000 * 14;
            res.cookie("order", { orderId: null }, { expires: new Date(Date.now() + expiresTime), httpOnly: true });
        }

    },
    'getAllOrders': function (req, res, next) {
        var currentUser = req.user.id;
        orderService.getAllOrders(currentUser, function (err, foundOrders) {
            return res.status(200).json({ err: false, orders: foundOrders });
        });
    },
    'getCurrentCart': function (req, res, next) {
        var orderId = req.cookies.order != null ? req.cookies.order.orderId : null;

        orderService.getCurrentOrder(req.user, orderId, "cart", function (err, foundOrder) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server eror in getCurrentCart", error: err });
            }

            return res.status(200).json({ err: false, order: foundOrder });
        });

    },
    'getByTrackingCode': function (req, res) {
        var trackingCode = req.query.trackingCode;

        if (trackingCode) {
            orderService.getByTrackingCode(trackingCode, function (err, foundOrder) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "Error in getByTrackingCode" });
                }

                return res.status(200).json({ err: false, order: foundOrder });
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "Tracking code not found" });
        }
    },
    'checkout': function (req, res) {
        var shippingInfo = {
            street: req.body.street,
            city: req.body.city,
            receiver: req.body.receiver
        };
        if (shippingInfo.street == null || shippingInfo.street == ""
            || shippingInfo.city == null || shippingInfo.city == ""
            || shippingInfo.receiver == null || shippingInfo.receiver == ""
        ) {
            return res.status(200).json({ err: true, msg: "Lacking of shippingInfo" });
        }

        var orderId = null;
        if (req.cookies.order) {
            orderId = req.cookies.orderId;
        }

        if (req.user || orderId) {
            orderService.checkout(req.user, orderId, shippingInfo, function (err, result, msg, order) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "server error in checkout" });
                }

                return res.status(200).json({ err: !result, msg: msg, order: order });
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "Order not found" });
        }
    },
    //delete order
    'delete': function (req, res) {
        var id = req.params.id;

        if (id == null) {
            return res.status(200).json({ err: true, msg: "Order id is missing" });
        }

        orderService.delete(id, function (err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error in OrderController/delete" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });
    },
};

