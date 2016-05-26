var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiOrderUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/admin/OrderController.js  
* and /api/routes/orderRoutes.js for more details
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

    //query method in in /api/controllers/v1/OrderController.js
    it('should not let normal user query all orders', function (done) {
        var apiLogin = testConfig.apiLogin;
        server
            .post(apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL)  // Attempt to use OrderController (see api/routes/orderRoutes.js)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(401);  // 401: Unauthorized!
                        done();
                    });
            });

    });

    //query method in /api/controllers/v1/OrderController.js
    it('should let only admin query orders', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .get(apiURL)  // query lastest orders
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 
                        // Check returned data

                        var returnData = res.body.data;
                        var total = res.body.count;
                        assert.equal(oldOrders.length, total)
                        //check pagination
                        assert.equal(true, returnData.length <= testConfig.itemsPerPage);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/OrderController.js with param: page 2
    it('should let admin query orders in page 2', function (done) {

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
                    .get(queryUrl)  // query orders in pages 2
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        assert.equal(newOrders.length, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //becase we have 7 record in database (initData.js)
                        //page size = 5, so the number of database in page 2 must be 2
                        assert.equal(2, returnedData.length);
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/OrderController.js with keyword = Nguyen
    it('should let admin query orders which receiver name contains Nguyen', function (done) {

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                //query with keyword = Nguyen
                var queryUrl = apiURL + "?keyword=Nguyen";
                server
                    .get(queryUrl)  // query order
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;

                        //only one order is returned
                        assert.equal(6, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        assert.equal(5, returnedData.length);

                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/OrderController.js with keyword = Nguyen, page = 2
    it('should let admin query user which name contains Nguyen in page 2', function (done) {

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?keyword=Nguyen&page=2";
                server
                    .get(queryUrl)  // query orders
                    .expect('Content-type', /json/)
                    .end(function (err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned data
                        var returnedData = res.body.data;
                        var total = res.body.count;
                        //all orders in database have name contains order
                        assert.equal(6, total)
                        assert.equal(true, returnedData.length <= testConfig.itemsPerPage);
                        //because we query data in page 2, page size = 5 so the return data must
                        //contain 1 orders
                        assert.equal(1, returnedData.length);
                        done();
                    });
            });

    });

    // get in /api/controllers/v1/OrderController.js
    it('should not let normal user query order by its id', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200); // OK

                server
                    .get(apiURL + "/" + newOrders[0].id)
                    .expect('Content-type', /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //forbidden, because you are not admin
                        res.status.should.equal(401);
                        done();
                    });
            });
    });

    // get in /api/controllers/v1/OrderController.js
    it('should let admin query order by its id', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/" + newOrders[0].id)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        // Check returned order
                        var returnedData = res.body;
                        assert.equal(newOrders[0].id, returnedData.id);
                        done();
                    });
            });
    });

    // post in /api/controllers/v1/OrderController.js
    it('should not let normal user create/update order', function (done) {
        var updatingOrder = newOrders[0];
        updatingOrder.name = "test new name";

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as admin normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingOrder)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //forbidden
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/OrderController.js
    it('should let admin create order', function (done) {
        var newlyOrder = oldOrders[1];
        newlyOrder.shippingAddress = { street: "Newly Order", city: "Newly Order", receiver: "Newly Order" };
        newlyOrder.lineItems = [
            { product: newProducts[0].id, quantity: 1 },
            { product: newProducts[2].id, quantity: 2 },
            { product: newProducts[3].id, quantity: 3 }
        ];

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(newlyOrder)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {

                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        assert.equal(3, res.body.data.lineItems.length);
                        assert.equal(true, res.body.data.id.length > 0);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/OrderController.js
    it('should let admin update order, line items is update when state = cart or checkout only', function (done) {
        var updatingOrder = newOrders[0].toObject();
        updatingOrder.shippingAddress = { street: "update Order", city: "update Order", receiver: "update Order" };
        updatingOrder.state = "cart";

        updatingOrder.lineItems = [
            { product: newProducts[0].id, quantity: 4 },
            { product: newProducts[2].id, quantity: 5 },
            { product: newProducts[3].id, quantity: 6 }
        ];

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingOrder)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);

                        var returnedOrder = res.body.data;
                        assert.equal(updatingOrder.lineItems.length, returnedOrder.lineItems.length);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    // post in /api/controllers/v1/OrderController.js
    it('should let admin update order, line items is not update when state != cart or checkout', function (done) {
        var updatingOrder = newOrders[0].toObject();
        updatingOrder.shippingAddress = { street: "update Order", city: "update Order", receiver: "update Order" };
        updatingOrder.state = "ordered";

        updatingOrder.lineItems = [
            { product: newProducts[0].id, quantity: 4 },
            { product: newProducts[2].id, quantity: 5 },
            { product: newProducts[3].id, quantity: 6 }
        ];

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingOrder)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);

                        var returnedOrder = res.body.data;
                        assert.equal(true, updatingOrder.lineItems.length != returnedOrder.lineItems.length);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });
    });


    // post in /api/controllers/v1/OrderController.js
    it('should let admin update order line items manually', function (done) {
        var updatingOrder = newOrders[0].toObject();

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL + "/updateLineItems")
                    .send(updatingOrder)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);

                        var returnedOrder = res.body.data;
                        assert.equal(true, returnedOrder.subTotal > 0);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });
    });

    // post in /api/controllers/v1/OrderController.js
    it('should not let admin update user with missing fields', function (done) {
        var updatingOrder = newOrders[0].toObject();
        updatingOrder.shippingAddress = { street: "update Order", city: "update Order", receiver: "update Order" };
        updatingOrder.state = null;

        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingOrder)
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

    // delete in /api/controllers/v1/OrderController.js
    it('should not let normal user delete order', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newOrders[0].id)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function (err, res) {
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/OrderController.js
    it('should let admin delete order with state = cart or cancel', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newOrders[0].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });

    // delete in /api/controllers/v1/OrderController.js
    it('should not let admin delete order with state != cart or cancel', function (done) {
        server
            .post(testConfig.apiLogin)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function (err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newOrders[1].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        assert.equal(true, res.body.err);
                        done();
                    });
            });

    });
    after(function (done) {
        done();
    });

});