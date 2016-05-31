var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.homeApi;
var initData = require('../initData');

/*
* See /api/controllers/v1/HomeController.js  
* and /api/routes/homeRoutes.js for more details
*/
describe('Home Controller Test', function () {
    var newUsers = [];
    var oldUsers = [];
    var newArticles = [];
    var oldArticles = [];
    var newProducts = [];
    var oldProducts = [];
    var oldCategories = [];
    var newCategories = [];

    beforeEach(function (done) {
        initData(function (returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            newArticles = returnData.newArticles;
            oldArticles = returnData.oldArticles;
            newProducts = returnData.newProducts;
            oldProducts = returnData.oldProducts;
            newCategories = returnData.newCategories;
            oldCategories = returnData.oldCategories;

            done();
        });
    });

    //query method in /api/controllers/v1/HomeController.js  
    it('user go to home page and see products with pagination', function (done) {
        server
            .get(apiURL)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                //check returned data
                assert.equal(5, res.body.products.length);
                assert.equal(oldProducts.length, res.body.total);
                done();
            });

    });

    //query method in /api/controllers/v1/HomeController.js  
    it('user go to page 2 and see the products in page 2', function (done) {
        server
            .get(apiURL + "?page=2")
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                assert.equal(oldProducts.length - 5, res.body.products.length);
                assert.equal(oldProducts.length, res.body.total);
                done();
            });
    });

    //query method in /api/controllers/v1/HomeController.js  
    it('users can see products in a specific category', function (done) {
        server
            .get(apiURL + "?page=1&category=" + newCategories[0].id)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                assert.equal(5, res.body.products.length);
                done();
            });
    });

    //query method in /api/controllers/v1/HomeController.js  
    it('users can see products in a specific category with paging supported', function (done) {
        server
            .get(apiURL + "?page=2&" + newCategories[0].id)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                assert.equal(1, res.body.products.length);
                assert.equal(newProducts.length, res.body.total);
                done();
            });
    });

    //query method in /api/controllers/v1/HomeController.js  
    it('users can search for product', function (done) {
        server
            .get(apiURL + "/searchProducts?page=1&key=product")
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                assert.equal(5, res.body.products.length);
                assert.equal(newProducts.length, res.body.total);
                done();
            });
    });

    //getProduct method in /api/controllers/v1/HomeController.js  
    it('user can see active product details', function (done) {
        server
            .get(testConfig.homeApi + "/" + newProducts[0].id)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                //compare returned data
                assert.equal(newProducts[0].id, res.body.product.id);
                done();
            });
    });

    //getProduct method in /api/controllers/v1/HomeController.js  
    it('user can not see inactive product details', function (done) {
        server
            .get(testConfig.homeApi + "/" + newProducts[6].id)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                //compare returned data
                assert.equal(null, res.body.product);
                done();
            });
    });

    //getProduct method in /api/controllers/v1/HomeController.js  
    it('user can not see product with wrong url', function (done) {
        server
            .get(testConfig.homeApi + "/abc")
            .expect('Content-type', /json/)
            .end(function (err, res) {
                //compare returned data
                assert.equal(null, res.body.product);
                done();
            });
    });

    after(function (done) {
        done();
    });

});