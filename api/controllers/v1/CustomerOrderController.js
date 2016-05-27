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
    'getCurrentCart': function (req, res, next) {
        if (req.user) {
            orderService.getCurrentCart(req.user, req.cookies.orderId, function (err, foundOrder) {
                if (foundOrder) {
                    req.currentCart = foundOrder;
                }
                next();
            })
        }
        else {
            next();
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

