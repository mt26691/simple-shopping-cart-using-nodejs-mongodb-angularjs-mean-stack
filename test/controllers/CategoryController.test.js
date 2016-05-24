var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiCategoryUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/admin/CategoryController.js  
* and /api/routes/categoryRoutes.js for more details
*/
describe('Admin Category Controller Test', function () {
    var newUsers = [];
    var oldUsers = [];
    var newCategories = [];
    var oldCategories = [];

    beforeEach(function (done) {
        initData(function (returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            newCategories = returnData.newCategories;
            oldCategories = returnData.oldCategories;
            done();
        });
    });

    //query method in in /api/controllers/v1/CategoryController.js
    it('should not let normal user query all categories', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL)  // Attempt to use CategoryController (see api/routes/categoryRoutes.js)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(401);  // 401: Unauthorized!
                        done();
                    });
            });

    });

    //query method in /api/controllers/v1/CategoryController.js
    it('should let only admin query categories', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL)  // query lastest categories
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 
                        // Check returned data
                        var returnData = res.body.data;
                        var total = res.body.count;
                        assert.equal(oldCategories.length, total)
                        //check pagination
                        assert.equal(true, returnData.length <= testConfig.itemsPerPage);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/CategoryController.js with param: page 2
    it('should let admin query categories in page 2', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with param page = 2
                var queryUrl = apiURL + "?page=2";
                server
                    .get(queryUrl)  // query categories in pages 2
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        assert.equal(newCategories.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //becase we have 6 record in database (initData.js)
                        //page size = 5, so the number of database in page 2 must be 1
                        assert.equal(1, returnedData.length);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/CategoryController.js with keyword = category 03
    it('should let admin query categories which name contains category 03', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with keyword = category 06
                var queryUrl = apiURL + "?keyword=category 03";
                server
                    .get(queryUrl)  // query category
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        //only one category is returned
                        assert.equal(1, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(1, returnedData.length);

                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/CategoryController.js with keyword = category, page = 2
    it('should let admin query user which name contains category in page 2', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?keyword=category&page=2";
                server
                    .get(queryUrl)  // query categories
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        //all categories in database have name contains category
                        assert.equal(3, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //because we query data in page 2, page size = 5 so the return data must
                        //contain only one category
                        assert.equal(0, returnedData.length);
                        done();
                    });
            });

    });

    // get in /api/controllers/v1/CategoryController.js
    it('should not let normal user query category by its id', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL + "/" + newCategories[0].id)
                    .expect('Content-type', /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //forbidden, because you are not admin
                        res.status.should.equal(401);
                        done();
                    });
            });
    });

    // get in /api/controllers/v1/CategoryController.js
    it('should let admin query category by its id', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/" + newCategories[0].id)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        // Check returned subject
                        var returnedData = res.body;

                        assert.equal(newCategories[0].name, returnedData.name);
                        assert.equal(newCategories[0].id, returnedData.id);
                        assert.equal(newCategories[0].nameUrl, returnedData.nameUrl);
                        assert.equal(newCategories[0].description, returnedData.description);
                        assert.equal(newCategories[0].isActive, returnedData.isActive);
                        done();
                    });
            });
    });

    // post in /api/controllers/v1/CategoryController.js
    it('should not let normal user create/update category', function (done) {
        var updatingCategory = newCategories[0];
        updatingCategory.name = "test new name";

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as admin normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingCategory)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //forbidden
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/CategoryController.js
    it('should let admin create category', function (done) {
        var newlyCategory = oldCategories[0];
        newlyCategory.name = "test new category";

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(newlyCategory)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(newlyCategory.name, res.body.data.name);
                        assert.equal(true, res.body.data.id.length > 0);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/CategoryController.js
    it('should let admin update category', function (done) {
        var updatingCategory = newCategories[0];
        updatingCategory.name = "test new category";
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingCategory)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(updatingCategory.name, res.body.data.name);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/CategoryController.js
    it('should not let admin update category with missing fields', function (done) {
        var updatingCategory = newCategories[0];
        updatingCategory.name = null;

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingCategory)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        //error = true because of missing name field
                        assert.equal(true, res.body.err);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/CategoryController.js
    it('should not let normal user delete category', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newCategories[0].id)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function (err, res) {
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/CategoryController.js
    it('should let admin delete category', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newCategories[0].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/CategoryController.js
    it('should not let admin delete category which has decendant', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newCategories[0].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/CategoryController.js
    it('should not let admin delete category which has products', function (done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newCategories[0].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    after(function (done) {
        done();
    });

});