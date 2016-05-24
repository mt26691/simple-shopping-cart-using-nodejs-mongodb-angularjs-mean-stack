var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiProductUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/admin/ProductController.js  
* and /api/routes/productRoutes.js for more details
*/
describe('Admin Product Controller Test', function () {
    var newUsers = [];
    var oldUsers = [];
    var newProducts = [];
    var oldProducts = [];

    beforeEach(function (done) {
        initData(function (returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            newProducts = returnData.newProducts;
            oldProducts = returnData.oldProducts;
            done();
        });
    });

    //query method in in /api/controllers/v1/ProductController.js
    it('should not let normal user query all products', function (done) {
        var apiLogin = testConfig.apiLogin;
        server
            .post(apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL)  // Attempt to use ProductController (see api/routes/productRoutes.js)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(401);  // 401: Unauthorized!
                        done();
                    });
            });

    });

    //query method in /api/controllers/v1/ProductController.js
    it('should let only admin query products', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL)  // query lastest products
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 
                        // Check returned data

                        var returnData = res.body.data;
                        var total = res.body.count;
                        assert.equal(oldProducts.length, total)
                        //check pagination
                        assert.equal(true, returnData.length <= testConfig.itemsPerPage);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/ProductController.js with param: page 2
    it('should let admin query products in page 2', function (done) {

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with param page = 2
                var queryUrl = apiURL + "?page=2";
                server
                    .get(queryUrl)  // query products in pages 2
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        assert.equal(newProducts.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //becase we have 6 record in database (initData.js)
                        //page size = 5, so the number of database in page 2 must be 1
                        assert.equal(1, returnedData.length);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/ProductController.js with keyword = product 06
    it('should let admin query products which name contains product 06', function (done) {

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with keyword = product 06
                var queryUrl = apiURL + "?keyword=product 06";
                server
                    .get(queryUrl)  // query product
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;

                        //only one product is returned
                        assert.equal(1, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(1, returnedData.length);

                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/ProductController.js with keyword = product, page = 2
    it('should let admin query user which name contains product in page 2', function (done) {

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?keyword=product&page=2";
                server
                    .get(queryUrl)  // query products
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        //all products in database have name contains product
                        assert.equal(newProducts.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //because we query data in page 2, page size = 5 so the return data must
                        //contain 1 products
                        assert.equal(1, returnedData.length);
                        done();
                    });
            });

    });

    // get in /api/controllers/v1/ProductController.js
    it('should not let normal user query product by its id', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL + "/" + newProducts[0].id)
                    .expect('Content-type', /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //forbidden, because you are not admin
                        res.status.should.equal(401);
                        done();
                    });
            });
    });

    // get in /api/controllers/v1/ProductController.js
    it('should let admin query product by its id', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/" + newProducts[0].id)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        // Check returned product
                        var returnedData = res.body;

                        assert.equal(newProducts[0].name, returnedData.name);
                        assert.equal(newProducts[0].id, returnedData.id);
                        assert.equal(newProducts[0].slug, returnedData.slug);
                        assert.equal(newProducts[0].description, returnedData.description);
                        assert.equal(newProducts[0].isActive, returnedData.isActive);
                        done();
                    });
            });
    });

    // post in /api/controllers/v1/ProductController.js
    it('should not let normal user create/update product', function (done) {
        var updatingProduct = newProducts[0];
        updatingProduct.name = "test new name";

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as admin normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingProduct)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //forbidden
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/ProductController.js
    it('should let admin create product', function (done) {
        var newlyProduct = oldProducts[0];
        newlyProduct.name = "test new product";

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(newlyProduct)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(newlyProduct.name, res.body.data.name);
                        assert.equal(true, res.body.data.id.length > 0);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/ProductController.js
    it('should let admin update product', function (done) {
        var updatingProduct = newProducts[0];
        updatingProduct.name = "test new product";
        //change product pricing
        updatingProduct.pricing = { retail: 99, sale: 80, stock: 30 };
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingProduct)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                       
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(updatingProduct.name, res.body.data.name);
                        assert.equal(1, res.body.data.priceHistory.length)
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/ProductController.js
    it('should not let admin update user with missing fields', function (done) {
        var updatingProduct = newProducts[0];
        updatingProduct.name = null;

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingProduct)
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

    // delete in /api/controllers/v1/ProductController.js
    it('should not let normal user delete product', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newProducts[0].id)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function (err, res) {
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/ProductController.js
    it('should let admin delete brand new product (no order contains this product)', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newProducts[0].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });
    
        // delete in /api/controllers/v1/ProductController.js
    it('should let not admin delete old product (some orders contain this product)', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newProducts[0].id)
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