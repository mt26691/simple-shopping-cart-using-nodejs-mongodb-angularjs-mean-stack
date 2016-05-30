var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiCustomerOrderUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/CustomOrderController.js  
* and /api/routes/customerOrderRoutes.js for more details
*/
describe('Admin Order Controller Test', function () {
    var newUsers = [];
    var oldUsers = [];
    var newOrders = [];
    var oldOrders = [];
    var newProducts = [];
    beforeEach(function (done) {
        initData(function (returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            newOrders = returnData.newOrders;
            oldOrders = returnData.oldOrders;
            newProducts = returnData.newProducts;

            done();
        });
    });

    //addToCart method in in /api/controllers/v1/CustomOrderController.js
    it('should let anonymous customer add product to cart', function (done) {
        var products = {
            product: newProducts[0].id,
            quantity: 1
        };

        server
            .post(apiURL + "/addToCart")
            .send(products)  //send as anonymous
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK

                var returnData = res.body.cart;
                assert.equal(true, returnData.lineItems.length > 0);
                assert.equal("cart", returnData.state);
                done();
            });

    });

    //addToCart method in in /api/controllers/v1/CustomOrderController.js
    it('should let logged customer add product to cart', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok

                var products = {
                    product: newProducts[0].id,
                    quantity: 1
                };

                server
                    .post(apiURL + "/addToCart")  // add to cart
                    .send(products)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200); // OK
                        var returnData = res.body.cart;
                        assert.equal(true, returnData.lineItems.length == 1);
                        assert.equal("cart", returnData.state);
                        done();
                    });
            });
    });

    //addToCart method in in /api/controllers/v1/CustomOrderController.js
    it('should remove product from cart if product quantity is 0', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as normal user, who current has no product in his cart
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok

                var product = { product: newProducts[5].id, quantity: 6 };

                server
                    .post(apiURL + "/addToCart")  // add to cart
                    .send(product)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200); // OK
                        var returnData = res.body.cart;

                        assert.equal(true, returnData.lineItems.length == 2);
                        assert.equal("cart", returnData.state);

                        //set quantity to 0
                        product = { product: newProducts[0].id, quantity: 0 };

                        server
                            .post(apiURL + "/addToCart")  // add to cart
                            .send(product)
                            .expect('Content-type', /json/)
                            .end(function (err, res) {

                                var returnData = res.body.cart;

                                assert.equal(true, returnData.lineItems.length == 1);
                                assert.equal("cart", returnData.state);
                                done();
                            });

                    });

            });

    });

    //addToCart method in in /api/controllers/v1/CustomOrderController.js
    it('should not let user add fake product to cart', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                //fake product
                var product = {
                    product: "xxxx",
                    quantity: 1
                };

                server
                    .post(apiURL + "/addToCart")  // add to cart
                    .send(product)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200); // OK
                        var returnData = res.body;
                        assert.equal(true, returnData.err);
                        done();
                    });

            });

    });

    // //query method in /api/controllers/v1/CustomOrderController.js with param: page 2
    // it('should let anonymous who recently logged migrate cart', function (done) {

    //     var products = {
    //         product: newProducts[0].id,
    //         quantity: 1
    //     };

    //     server
    //         .post(apiURL + "/addToCart")
    //         .send(products)  //send as anonymous
    //         .expect('Content-type', /json/)
    //         .expect(200)
    //         .end(function (err, res) {
    //             res.status.should.equal(200); // OK

    //             var returnData = res.body.cart;
    //             assert.equal(true, returnData.lineItems.length > 0);
    //             assert.equal("cart", returnData.state);

    //             server
    //                 .post(testConfig.apiLogin)
    //                 .send(oldUsers[1])  // log in as normal user
    //                 .expect('Content-type', /json/)
    //                 .end(function (err, res) {

    //                     server
    //                         .get(apiURL + "/currentCart")
    //                         .expect(200)
    //                         .end(function (err, res) {
    //                             //check product id here
    //                             done();
    //                         });
    //                 });
    //         });
    // });

    //get current cart
    it('Should let current user see their cart', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/currentCart")  // query cart
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I can see my cart 
                        // Check returned data

                        assert.equal(false, res.body.err);
                        done();
                    });
            });
    });

    //allOrders method in /api/controllers/v1/CustomOrderController.js
    it('Should let anonymous users see their cart', function (done) {

        var products = {
            product: newProducts[0].id,
            quantity: 1
        };

        server
            .post(apiURL + "/addToCart")
            .send(products)  //send as anonymous
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK

                var returnData = res.body.cart;
                assert.equal(true, returnData.lineItems.length > 0);
                assert.equal("cart", returnData.state);

                server
                    .get(apiURL + "/currentCart")  // query cart
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I can see my cart 

                        // Check returned data
                        assert.equal(true, returnData.lineItems.length > 0);
                        assert.equal("cart", returnData.state);
                        done();
                    });

            });


    });

    //allOrders method in /api/controllers/v1/CustomOrderController.js
    it('Should let current user see all of their orders', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/allOrders")  // query all orders
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I can see my cart 

                        // Check returned data
                        assert.equal(true, res.body.orders.length > 0);
                        done();
                    });
            });
    });

    //getByTrackingCode method in /api/controllers/v1/CustomOrderController.js
    it('should let anonymous user tracking order based on tracking code', function (done) {
        server
            .get(apiURL + "/getByTrackingCode?trackingCode=" + oldOrders[7].trackingCode)  // get order by tracking code
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);  // query OK because I can see my cart by tracking code
                // Check returned data
                assert.equal(false, res.body.err);
                assert.equal(oldOrders[7].trackingCode, res.body.order.trackingCode)
                done();
            });

    });

    // checkout in /api/controllers/v1/CustomOrderController.js
    it('should let current user checkout', function (done) {
        var checkoutInfo = {
            street: "Check out street",
            city: "checkout city",
            receiver: "check out receiver"
        };

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                server
                    .post(apiURL + "/checkout")  //check out cart
                    .send(checkoutInfo)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        var order = res.body.order;
                        // Check returned data
                        assert.equal("checkout", order.state);
                        done();
                    });
            });
    });

    // get in /api/controllers/v1/CustomOrderController.js
    it('should let anonymous user checkout', function (done) {
        server
            .post(apiURL + "/checkout")  // query cart
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);  // query OK because I can see my cart 

                // Check returned data
                done();
            });
    });

    after(function (done) {
        done();
    });

});