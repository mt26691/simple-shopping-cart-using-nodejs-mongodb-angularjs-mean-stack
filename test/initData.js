var data = { oldUsers: [], newUsers: [] };
module.exports = function (callback) {
    var models = require('../api/models/models')();

    var User = models.User;
    var Article = models.Article;
    var AccessToken = models.AccessToken;
    var Comment = models.Comment;
    var Category = models.Category;
    var Product = models.Product;
    var Order = models.Order;

    data.oldUsers = [
        //0 normal user
        { name: "user01", email: "user01@gmail.com", password: "123456", role: "normal" },
        //1 admin user
        { name: "user02", email: "user02@gmail.com", password: "123456", role: "admin" },
        { name: "user03", email: "user03@gmail.com", password: "123456", role: "normal" },
        { name: "user04", email: "user04@gmail.com", password: "123456", role: "normal" },
        { name: "user05", email: "user05@gmail.com", password: "123456", role: "normal" },
        { name: "user06", email: "user06@gmail.com", password: "123456", role: "normal" },
    ];

    var mongoose = require('mongoose');
    /* Connect to the DB */
    mongoose.connect('mongodb://localhost:27017/simple-shopping-cart', function () {
        /* Drop the DB */
        mongoose.connection.db.dropDatabase();
    });


    User.create(data.oldUsers, function (err, users) {
        data.newUsers = users;

        data.oldArticles = [
            //0
            { name: "Article 01", nameUrl: "article-01", description: "description 01", content: "content", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //1
            { name: "Article 02", nameUrl: "article-01", description: "description 02", content: "content", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //2
            { name: "Article 03", nameUrl: "article-01", description: "description 03", content: "content", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //3
            { name: "Article 04", nameUrl: "article-01", description: "description 04", content: "content", inActiveReason: "Not valid", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //4
            { name: "Article 05", nameUrl: "article-01", description: "description 05", content: "content", inActiveReason: "Not Valid", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //5
            { name: "Article 06", nameUrl: "article-01", description: "description 06", content: "content", inActiveReason: "Not Valid", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //6
            { name: "Article 07", nameUrl: "article-01", description: "description 06", content: "content", inActiveReason: "Not Valid", isActive: true, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
            //7
            { name: "Article 08", nameUrl: "article-01", description: "description 06", content: "content", inActiveReason: "Not Valid", isActive: false, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
        ];

        //create new articles
        Article.create(data.oldArticles, function (err, articles) {
            data.newArticles = articles;
            data.oldComments = [
                //0
                { content: "Comment content 1", isActive: true, article: data.newArticles[0].id, createdBy: data.newUsers[0].id, updatedBy: data.newUsers[1].id },
                //1
                { content: "Comment content 2", isActive: true, article: data.newArticles[1].id, createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                //2
                { content: "Comment content 03", isActive: true, article: data.newArticles[1].id, createdBy: data.newUsers[2].id, updatedBy: data.newUsers[1].id },
                //3
                { content: "Comment content 04", isActive: false, article: data.newArticles[1].id, createdBy: data.newUsers[3].id, updatedBy: data.newUsers[1].id },
                //4
                { content: "Comment content 05", isActive: false, article: data.newArticles[1].id, createdBy: data.newUsers[2].id, updatedBy: data.newUsers[1].id },
                //5
                { content: "Comment content 06", isActive: false, article: data.newArticles[1].id, createdBy: data.newUsers[4].id, updatedBy: data.newUsers[1].id },
            ];

            Comment.create(data.oldComments, function (err, newComments) {
                data.newComments = newComments;

                data.oldCategories = [
                    //0
                    { name: "Sport", slug: "Sport", description: "description 01", createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                    //1
                    { name: "Football", slug: "football", description: "description 02", createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                    //2
                    { name: "Football wear", slug: "football-wear", description: "description 03", createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                    //4
                    { name: "category 01", slug: "category-01", description: "description 04", createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                    //5
                    { name: "category 02", slug: "category-02", description: "description 05", createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                    //6
                    { name: "category 03", slug: "category-03", description: "description 05", createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id },
                ];

                Category.create(data.oldCategories, function (err, newCategories) {
                    data.newCategories = newCategories;
                    //add parent category
                    data.newCategories[1].parent = newCategories[0].id;
                    data.newCategories[1].ancestors.push(newCategories[0].id);
                    data.newCategories[2].parent = newCategories[1].id;
                    //add ancestors category
                    data.newCategories[2].ancestors.push(newCategories[0].id);
                    data.newCategories[2].ancestors.push(newCategories[1].id);

                    data.newCategories[1].save();
                    data.newCategories[2].save();
                    data.oldProducts = [
                        //0
                        {
                            name: "product 01", slug: "product-01", shortDescription: "short", description: "des00",
                            pricing: { retail: 100, sale: 90, stock: 80 }, primary_category: data.newCategories[0].id,
                            createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id
                        },
                        //1
                        {
                            name: "product 02", slug: "product-02", shortDescription: "short", description: "des01",
                            pricing: { retail: 100, sale: 90, stock: 80 }, primary_category: data.newCategories[0].id,
                            createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id
                        },
                        //2
                        {
                            name: "product 03", slug: "product-03", shortDescription: "short", description: "des02",
                            pricing: { retail: 100, sale: 90, stock: 80 }, primary_category: data.newCategories[0].id,
                            createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id
                        },
                        //3
                        {
                            name: "product 04", slug: "product-04", shortDescription: "short", description: "des03",
                            pricing: { retail: 100, sale: 90, stock: 80 }, primary_category: data.newCategories[0].id,
                            createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id
                        },
                        //4
                        {
                            name: "product 05", slug: "product-05", shortDescription: "short", description: "des04",
                            pricing: { retail: 100, sale: 90, stock: 80 }, primary_category: data.newCategories[0].id,
                            createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id
                        },
                        //5
                        {
                            name: "product 06", slug: "product-06", shortDescription: "short", description: "des06",
                            pricing: { retail: 100, sale: 90, stock: 80 }, primary_category: data.newCategories[1].id,
                            createdBy: data.newUsers[1].id, updatedBy: data.newUsers[1].id
                        },
                    ];

                    Product.create(data.oldProducts, function (err, newProducts) {
                        data.newProducts = newProducts;
                        callback(data);
                    });

                })

            });

        });
    });
};  