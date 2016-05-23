var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiUserUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/admin/UserController.js  
* and /api/routes/userRoutes.js for more details
*/
describe('User admin controller test', function() {
    var newUsers = [];
    var oldUsers = [];

    beforeEach(function(done) {
        initData(function(returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            done();
        });
    });
    //query method in /api/controllers/v1/admin/UserController.js  
    it('should not let normal user query all users', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // Log in as normal user
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                server
                    .get(apiURL)  // Attempt to use UserController 
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(401);  // 401: Unauthorized! Not OK
                        done();
                    });
            });

    });

    //query method in /api/controllers/v1/admin/UserController.js  
    it('should let only admin query users', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);
                assert.equal(true, !res.body.err);  // check if login is ok

                server
                    .get(testConfig.apiUserUrl)  // query all users
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned users
                        var returnedUsers = res.body.data;
                        var totalUsers = res.body.count;
                        assert.equal(newUsers.length, totalUsers)
                        assert.equal(true, returnedUsers.length <= testConfig.itemsPerPage);
                        assert.equal(false, 'password' in returnedUsers[0]);  // server removed password from object for security
                        assert.equal(false, 'password' in returnedUsers[1]);  // server removed password from object for security
                        done();
                    });

            });

    });

    //query method in /api/controllers/v1/admin/UserController.js
    //with param  {page:2}
    it('should let admin query user in page 2', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as admin
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?page=2";
                server
                    .get(queryUrl)  // query all users
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned users
                        var returnedUsers = res.body.data;
                        var totalUsers = res.body.count;
                        assert.equal(newUsers.length, totalUsers)
                        assert.equal(true, returnedUsers.length <= testConfig.itemsPerPage);
                        assert.equal(false, 'password' in returnedUsers[0]);  // server removed password from object for security
                        //because we have 6 users, so the page 2 has only one returned user
                        assert.equal(1, returnedUsers.length);  // server removed password from object for security
                        done();
                    });

            });

    });
    
    //query method in /api/controllers/v1/admin/UserController.js
    //with param  {keyword:'user06'}
    it('should let admin query user which name contain user06', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?keyword=user06";
                server
                    .get(queryUrl)  // query all users
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned users
                        var returnedUsers = res.body.data;
                        var totalUsers = res.body.count;
                        assert.equal(1, totalUsers)
                        assert.equal(true, returnedUsers.length <= testConfig.itemsPerPage);
                        assert.equal(false, 'password' in returnedUsers[0]);  // server removed password from object for security
                        assert.equal(1, returnedUsers.length);  // server removed password from object for security
                        done();
                    });

            });

    });
    
    //query method in /api/controllers/v1/admin/UserController.js
    //with param  {keyword:'user', page : 2}
    it('should let admin query user which name contains user in page 2', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                var queryUrl = apiURL + "?keyword=user&page=2";
                server
                    .get(queryUrl)  // query all users
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        res.status.should.equal(200);  // query OK because I am ADMIN 

                        // Check returned users
                        var returnedUsers = res.body.data;
                        var totalUsers = res.body.count;
                        assert.equal(newUsers.length, totalUsers)
                        assert.equal(true, returnedUsers.length <= testConfig.itemsPerPage);
                        assert.equal(false, 'password' in returnedUsers[0]);  // server removed password from object for security
                        //because we have 6 users whose name contains user. But we query data in page 2 so only 1 
                        //user was returned
                        assert.equal(1, returnedUsers.length);  // server removed password from object for security
                        done();
                    });
            });

    });

    //get method in /api/controllers/v1/admin/UserController.js
    it('should not let normal user query an user by its id', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as Normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);
                server
                    .get(apiURL + "/" + newUsers[0].id)
                    .expect('Content-type', /json/)
                    .expect(401)
                    .end(function(err, res) {
                        //forbidden, because we don't have right to access to page.
                        //try to modify /api/policies/isAdmin.js and /api/routes/userRoutes.js
                        res.status.should.equal(401);
                        done();
                    });
            });
    });

    //get method in /api/controllers/v1/admin/UserController.js
    it('should let only admin query an user by its id', function(done) {  // modify 'get' in policies.js 
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                server
                    .get(apiURL + "/" + newUsers[0].id)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200); //query OK because I'm admin

                        // Check returned user
                        var returnedUser = res.body;

                        assert.equal(newUsers[0].name, returnedUser.name);
                        assert.equal(newUsers[0].email, returnedUser.email);
                        assert.equal(false, 'password' in returnedUser);  // server removed password from object for security
                        done();
                    });
            });
    });

    //post method in /api/controllers/v1/admin/UserController.js
    it('should not let normal user update other user', function(done) {
        var updatingUser = newUsers[0];
        updatingUser.name = "test new name";

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as normal user
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingUser)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function(err, res) {
                        //forbidden, because we don't have right to access to page.
                        //try to modify /api/policies/isAdmin.js and /api/routes/userRoutes.js
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    //post method in /api/controllers/v1/admin/UserController.js
    it('should let only admin update a user', function(done) {
        var updatingUser = newUsers[0];
        updatingUser.name = "test new name";

        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingUser)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        //update ok because I'm Admin
                        res.status.should.equal(200);
                        assert.equal(false, res.body.err);
                        done();
                    });
            });

    });
    
    //post method in /api/controllers/v1/admin/UserController.js
    //it does not let admin change user with duplicate email
    it('should not let admin update user with duplicate email', function(done) {
        var updatingUser = newUsers[0];
        updatingUser.name = "test new name";
        updatingUser.email = newUsers[1].email;
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingUser)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        //error = true because of duplicate email
                        assert.equal(true, res.body.err);
                        done();
                    });
            });

    });
    
    //post method in /api/controllers/v1/admin/UserController.js
    //it does not let admin change user 
    it('should not let admin update user with missing fields', function(done) {
        var updatingUser = newUsers[0];
        updatingUser.name = "test new name";
        updatingUser.email = null;
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .post(apiURL)
                    .send(updatingUser)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        res.status.should.equal(200);
                        //error = true because of missing email field
                        assert.equal(true, res.body.err);
                        done();
                    });
            });

    });

    //delete method in /api/controllers/v1/admin/UserController.js
    it('should not let normal user delete user', function(done) {
        var apiAuth = testConfig.apiLogin;
        server
            .post(apiAuth)
            .send(oldUsers[0])  // log in as Normal User
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newUsers[2].id)
                    .expect("Content-type", /json/)
                    .expect(401)
                    .end(function(err, res) {
                        //forbidden, because we don't have right to access to page.
                        //try to modify /api/policies/isAdmin.js and /api/routes/userRoutes.js
                        res.status.should.equal(401);
                        done();
                    });
            });

    });

    //delete method in /api/controllers/v1/admin/UserController.js
    it('should let admin delete user', function(done) {
        var apiAuth = testConfig.apiAuthUrl + '/login/local';
        server
            .post(apiAuth)
            .send(oldUsers[1])  // log in as ADMIN
            .expect('Content-type', /json/)
            .end(function(err, res) {
                res.status.should.equal(200);

                assert.equal(true, !res.body.err);  // check if login is ok
                server
                    .delete(apiURL + "/" + newUsers[2].id)
                    .expect("Content-type", /json/)
                    .expect(200)
                    .end(function(err, res) {
                        //delete ok because I'm Admin
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