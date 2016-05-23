var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiCommenttUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/admin/CommentController.js  
* and /api/routes/commentRoutes.js for more details
*/
describe('Admin Comment Controller Test', function() {
    var newUsers = [];
    var oldUsers = [];
    var newArticles = [];
    var oldArtiles = [];
    var newComments = [];
    var oldComments = [];

    beforeEach(function(done) {
        
        initData(function(returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            newArticles = returnData.newArticles;
            oldArtiles = returnData.oldArtiles;
            oldComments = returnData.oldComments;
            newComments = returnData.newComments;
            done();
        });
    });
    //query method in /api/controllers/v1/admin/CommentController.js 
    it('should not let normal user query all comments', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL)  // Attempt to use CommentController (see api/routes/commentRoutes.js)
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(401);  // 401: Unauthorized!
                        done();
                    });
            });

    });

    //query method in /api/controllers/v1/admin/CommentController.js 
    it('should let only admin query all comments', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL)  // query last 5 comments
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 
                        // Check returned comments
                        var returnData = res.body.data;

                        var total = res.body.count;
                        assert.equal(newComments.length, total)
                        assert.equal(true, returnData.length <= testConfig.itemsPerPage);
                        done();
                    });

            });

    });

    //query in CommentController with param: page 2
    it('should let admin query comment in page 2', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL + "?page=2")  // query all comments in page 2
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        assert.equal(newComments.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(1, returnedData.length);
                        done();
                    });

            });

    });

    //query method in api/v1/admin/CommentController.js with param: keyword = Comment content 05
    it('should let admin query comment which contain Comment content 05', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL + "?keyword=Comment content 05")  // query all users
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;

                        //only one subject has name = subject 02
                        assert.equal(1, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(1, returnedData.length);

                        done();
                    });

            });

    });

    //query method in api/v1/admin/CommentController.js with param: keyword = Comment, page = 2
    it('should let admin query comment which content contain Comment in page 2', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL + "?keyword=Comment&page=2")  // query lectures
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;

                        //only one Lecture has name contains Lecture in page 2
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(1, returnedData.length);
                        done();
                    });
            });
    });

    //get method in api/v1/admin/CommentController.js
    it('should not let normal user query comment by its id', function(done) {

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL + "/" + newComments[0].id)
                    .expect('Content-type', /json/)
                    .expect(401)
                    .end(function(err, res) {
                        //forbidden
                        res.status.should.equal(401);
                        done();
                    });
            });
    });

    //get method in api/v1/admin/CommentController.js
    it('should let only admin query comment by its id', function(done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/" + newComments[0].id)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);

                        // Check returned subject
                        var returnedData = res.body;
                        assert.equal(newComments[0].content, returnedData.content);
                        assert.equal(newComments[0].id, returnedData.id);
                        done();
                    });
            });
    });

    //post method in api/v1/admin/CommentController.js
    it('should let normal user create comment only', function(done) {
        var updatingItem = oldComments[5];
        updatingItem.content = "test new comment";

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as admin normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingItem)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    //post method in api/v1/admin/CommentController.js
    it('should not let normal user update comment', function(done) {
        var updatingItem = newComments[4];
        updatingItem.content = "test new comment";

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as admin normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingItem)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        assert(true, res.body.err);
                        done();
                    });
            });

    });

    //post method in api/v1/admin/CommentController.js
    it('should let only admin update all comment', function(done) {
        var newlyItem = newComments[0];
        newlyItem.content = "test content";

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(newlyItem)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(newlyItem.content, res.body.data.content);
                        assert.equal(true, res.body.data.id.length > 0);
                        done();
                    });
            });

    });

    //delete method in api/v1/admin/CommentController.js
    it('should not let normal users delete another comments', function(done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newComments[3].id)
                    .expect("Content-type", /json/)
                    .end(function(err, res) {
                        assert.equal(true, res.body.err);
                        done();
                    });
            });

    });

    //delete method in api/v1/admin/CommentController.js
    it('should let admin delete all comments', function(done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newComments[0].id)
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