/**
* Category Controller
*
* @module      :: Category Controller
* @description	:: CRUD Category for blog
*/

//load category services
var categoryService = require("../../../services/admin/CategoryService");

module.exports = {
    //query category in database, pagination supported
    'query': function(req, res) {
        //get current page
        var page = req.query.page == null ? 1 : req.query.page;
        //search key word
        var keyword = req.query.keyword == null ? "" : req.query.keyword;
        var queryData = { keyword: keyword, page: page, isActive: req.query.isActive };

        categoryService.query(queryData, function(err, data) {
            if (err) {
                res.status(500).json({ err: true, msg: "server error" });
            }
            else {
                //data contains data (list of categorys) and number of categorys
                res.status(200).json({ data: data.categorys, count: data.count });
            }
        });
    },

    //ger category base on id
    'get': function(req, res) {
        //get category id from req params.
        //we can do this because of routing setting in /api/routes/categoryRoutes.js
        var id = req.params.id;

        if (id != null) {
            categoryService.get(id, function(err, foundCategory) {
                if (err) {
                    return res.status(500).json({ err: true, msg: "Server error" });
                }
                if (!foundCategory) {
                    return res.status(200).json({ err: true, msg: "Category not found" });
                }
                //return category info to client
                return res.status(200).json(foundCategory);
            });
        }
        else {
            return res.status(200).json({ err: true, msg: "Id not found" });
        }
    },
    
    //create, update category
    'save': function(req, res) {
        var postData = req.body;
        //category data
        var item = {
            id: postData.id,
            name: postData.name,
            description: postData.description,
            isActive: postData.isActive,
            inActiveReason: postData.inActiveReason,
            level: postData.level,
            duration: postData.duration,
            image: postData.image,
            content: postData.content
        };
        
        if (item.id == null) {
            item.createdBy = req.user.id;
        }

        item.updatedBy = req.user.id;
        //check required field
        if (!item.name || !item.description || item.isActive == null) {
            return res.status(200).json({ err: true, msg: "missing some field" });
        }

        //create update category
        categoryService.save(item, function(err, result, msg, data) {
            if (err) {
                //return error back to client
                return res.status(500).json({ err: true, msg: "Server error in CategoryController/save" });
            }
            if (!result) {
                return res.status(200).json({ err: true, msg: msg });
            }
            return res.status(200).json({ err: !result, msg: msg, data: data });
        });

    },
    
    //delete category
    'delete': function(req, res) {
        var id = req.params.id;

        if (id == null) {
            return res.status(200).json({ err: true, msg: "Category id is missing" });
        }

        categoryService.delete(id, function(err, result, msg) {
            if (err) {
                return res.status(500).json({ err: true, msg: "Server error in CategoryController/delete" });
            }

            return res.status(200).json({ err: !result, msg: msg });
        });
    },
};

