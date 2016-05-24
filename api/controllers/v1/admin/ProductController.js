/**
* Product Controller
*
* @module      :: Product Controller
* @description	:: CRUD Product for blog
*/

//load product services
var productService = require("../../../services/admin/ProductService");

module.exports = {
    //query product in database, pagination supported
    'query': function(req, res) {
        //get current page
        var page = req.query.page == null ? 1 : req.query.page;
        //search key word
        var keyword = req.query.keyword == null ? "" : req.query.keyword;
        var queryData = { keyword: keyword, page: page, isActive: req.query.isActive };

        productService.query(queryData, function(err, data) {
            if (err) {
                res.status(500).json({ err: true, msg: "server error" });
            }
            else {
                //data contains data (list of categories) and number of categories
                res.status(200).json({ data: data.categories, count: data.count });
            }
        });
    },

    //ger product base on id
    'get': function(req, res) {
        //get product id from req params.
        //we can do this because of routing setting in /api/routes/productRoutes.js
        var id = req.params.id;

        if (id != null) {
            productService.get(id, function(err, foundProduct) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "Server error" });
                }
                if (!foundProduct) {
                    return res.status(200).json({ err: true, msg: "Product not found" });
                }
                //return product info to client
                return res.status(200).json(foundProduct);
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "Id not found" });
        }
    },
    
    //create, update product
    'save': function(req, res) {
        var postData = req.body;
        
        //product data
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

        //create update product
        productService.save(item, function(err, result, msg, data) {
            if (err) {
                //return error back to client
                return res.status(500).json({ err: true, msg: "Server error in ProductController/save" });
            }
            if (!result) {
                return res.status(200).json({ err: true, msg: msg });
            }
            return res.status(200).json({ err: !result, msg: msg, data: data });
        });

    },
    
    //delete product
    'delete': function(req, res) {
        var id = req.params.id;

        if (id == null) {
            return res.status(200).json({ err: true, msg: "Product id is missing" });
        }

        productService.delete(id, function(err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error in ProductController/delete" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });
    },
};

