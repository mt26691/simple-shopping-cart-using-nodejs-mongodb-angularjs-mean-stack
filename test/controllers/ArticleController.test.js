var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiArticleUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/admin/ArticleController.js  
* and /api/routes/articleRoutes.js for more details
*/
describe('Admin Article Controller Test', function() {
    var newUsers = [];
    var oldUsers = [];
    var newArticles = [];
    var oldArticles = [];

    beforeEach(function(done) {
        initData(function(returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            newArticles = returnData.newArticles;
            oldArticles = returnData.oldArticles;
            done();
        });
    });

    //query method in in /api/controllers/v1/ArticleController.js
    it('should not let normal user query all articles', function(done) {
        var apiLogin = testConfig.apiLogin;
        server
            .post(apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL)  // Attempt to use ArticleController (see api/routes/articleRoutes.js)
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(401);  // 401: Unauthorized!
                        done();
                    });
            });

    });

    //query method in /api/controllers/v1/ArticleController.js
    it('should let only admin query articles', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL)  // query lastest articles
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 
                        // Check returned data
                        var returnData = res.body.data;
                        var total = res.body.count;
                        assert.equal(oldArticles.length, total)
                        //check pagination
                        assert.equal(true, returnData.length <= testConfig.itemsPerPage);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/ArticleController.js with param: page 2
    it('should let admin query articles in page 2', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with param page = 2
                var queryUrl = apiURL + "?page=2";
                server
                    .get(queryUrl)  // query articles in pages 2
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        assert.equal(newArticles.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //becase we have 6 record in database (initData.js)
                        //page size = 5, so the number of database in page 2 must be 1
                        assert.equal(3, returnedData.length);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/ArticleController.js with keyword = article 06
    it('should let admin query articles which name contains article 06', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with keyword = article 06
                var queryUrl = apiURL + "?keyword=article 06";
                server
                    .get(queryUrl)  // query article
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        //only one article is returned
                        assert.equal(1, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(1, returnedData.length);

                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/ArticleController.js with keyword = article, page = 2
    it('should let admin query user which name contains article in page 2', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?keyword=article&page=2";
                server
                    .get(queryUrl)  // query articles
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        //all articles in database have name contains article
                        assert.equal(newArticles.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //because we query data in page 2, page size = 5 so the return data must
                        //contain only one article
                        assert.equal(3, returnedData.length);
                        done();
                    });
            });

    });

    // get in /api/controllers/v1/ArticleController.js
    it('should not let normal user query article by its id', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL + "/" + newArticles[0].id)
                    .expect('Content-type', /json/)
                    .expect(401)
                    .end(function(err, res) {
                        //forbidden, because you are not admin
                        res.status.should.equal(401);
                        done();
                    });
            });
    });

    // get in /api/controllers/v1/ArticleController.js
    it('should let admin query article by its id', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/" + newArticles[0].id)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        // Check returned subject
                        var returnedData = res.body;

                        assert.equal(newArticles[0].name, returnedData.name);
                        assert.equal(newArticles[0].id, returnedData.id);
                        assert.equal(newArticles[0].nameUrl, returnedData.nameUrl);
                        assert.equal(newArticles[0].description, returnedData.description);
                        assert.equal(newArticles[0].isActive, returnedData.isActive);
                        done();
                    });
            });
    });

    // post in /api/controllers/v1/ArticleController.js
    it('should not let normal user create/update subject', function(done) {
        var updatingArticle = newArticles[0];
        updatingArticle.name = "test new name";

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as admin normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingArticle)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function(err, res) {
                        //forbidden
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/ArticleController.js
    it('should let admin create artcile', function(done) {
        var newlyArticle = oldArticles[0];
        newlyArticle.name = "test new article";

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(newlyArticle)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(newlyArticle.name, res.body.data.name);
                        assert.equal(true, res.body.data.id.length > 0);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/ArticleController.js
    it('should let admin update article', function(done) {
        var updatingArticle = newArticles[0];
        updatingArticle.name = "test new article";
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingArticle)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(updatingArticle.name, res.body.data.name);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/ArticleController.js
    it('should not let admin update user with missing fields', function(done) {
        var updatingArticle = newArticles[0];
        updatingArticle.name = null;

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingArticle)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        //error = true because of missing name field
                        assert.equal(true, res.body.err);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/ArticleController.js
    it('should not let normal user delete artcile', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newArticles[0].id)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function(err, res) {
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/ArticleController.js
    it('should let admin delete article', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newArticles[0].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    after(function(done) {
        done();
    });

});