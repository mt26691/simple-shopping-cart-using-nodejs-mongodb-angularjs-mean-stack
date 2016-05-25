/**
* Order Controller
*
* @module      :: Order Controller
* @description	:: CRUD Order for blog
*/

//load order services
var orderService = require("../../../services/admin/OrderService");

module.exports = {
    //query order in database, pagination supported
    'query': function(req, res) {
        //get current page
        var page = req.query.page == null ? 1 : req.query.page;
        //search key word
        var keyword = req.query.keyword == null ? "" : req.query.keyword;
        var queryData = { keyword: keyword, page: page, isActive: req.query.isActive };

        orderService.query(queryData, function(err, data) {
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
    'get': function(req, res) {
        //get order id from req params.
        //we can do this because of routing setting in /api/routes/orderRoutes.js
        var id = req.params.id;

        if (id != null) {
            orderService.get(id, function(err, foundOrder) {
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
    'save': function(req, res) {
        var postData = req.body;
        
        //order data
        var item = {
            id: postData.id,
            name: postData.name,
            description: postData.description,
            parent: postData.parent,
            ancestors : postData.ancestors
        };
      
        if (item.id == null) {
            item.createdBy = req.user.id;
        }

        item.updatedBy = req.user.id;
        //check required field
        if (!item.name) {
            return res.status(200).json({ err: true, msg: "missing name" });
        }

        //create update order
        orderService.save(item, function(err, result, msg, data) {
            if (err) {
                //return error back to client
                return res.status(500).json({ err: true, msg: "Server error in OrderController/save" });
            }
            if (!result) {
                return res.status(200).json({ err: true, msg: msg });
            }
            return res.status(200).json({ err: !result, msg: msg, data: data });
        });

    },
    
    //delete order
    'delete': function(req, res) {
        var id = req.params.id;

        if (id == null) {
            return res.status(200).json({ err: true, msg: "Order id is missing" });
        }

        orderService.delete(id, function(err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error in OrderController/delete" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });
    },
};

