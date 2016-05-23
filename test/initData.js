var data = { oldUsers: [], newUsers: [] };
module.exports = function(callback) {
    var models = require('../api/models/models')();

    var User = models.User;
    var Article = models.Article;
    var AccessToken = models.AccessToken;
    var Comment = models.Comment;
    
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

    //remove all user in database
    User.remove({}, function() {
        User.create(data.oldUsers, function(err, users) {
            data.newUsers = users;
            AccessToken.remove({}, function(err) {
            });

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
            //remove all articles in database
            Article.remove({}, function() {
                //create new articles
                Article.create(data.oldArticles, function(err, articles) {
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

                    Comment.remove({}, function(err, result) {
                        Comment.create(data.oldComments, function(err, newComments) {
                            data.newComments = newComments;
                            callback(data);
                        });

                    });
                });
            });
        });
    });
};  