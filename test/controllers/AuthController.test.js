var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var initData = require('../initData');

/*
* See /api/controllers/v1/AuthController.js  
* and /api/routes/authRoutes.js for more details
*/
describe('Authentication controller test', function() {
    var newUsers = [];
    var oldUsers = [];

    beforeEach(function(done) {
        initData(function(returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            done();
        });
    });
    
    //login method
    //see /api/controllers/v1/AuthController logIn method
    it('should not let wrong email and password log in ', function(done) {
        var apiAuth = testConfig.apiLogin;
        var user = oldUsers[0];
        user.password = "wrong password";
        server
            .post(apiAuth)
            .send(user)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                var result = res.body;
                assert.ok(result.err);
                done();
            });
    });
    
    it('should let user log in if they provide right username and password', function(done) {
        var apiAuth = testConfig.apiLogin;
        server  // login
            .post(apiAuth)
            .send(oldUsers[0])  // login using email, password
            .expect('Content-type', /json/)
            .end(function(err, res) {
                assert.equal(true, !res.body.err);
                var returnedUser = res.body.user;
                assert.equal(newUsers[0].name, returnedUser.name);
                assert.equal(false, 'password' in returnedUser);  // server removed password from object for security
                done();
            });
    });

    // see /api/controllers/v1/AuthController logOut method
    it('should let user logout', function(done) {
        var apiAuth = testConfig.apiLogin;
        server  // login
            .post(apiAuth)
            .send(oldUsers[0])  // login using email, password
            .expect('Content-type', /json/)
            .end(function(err, res) {
                var returnedUser = res.body.user;
                var token = res.body.token;
                assert.equal(true, !res.body.err);
                assert.equal(newUsers[0].name, returnedUser.name);
                var apiAuth1 = testConfig.apiAccountUrl + '/me';

                server  // Get me
                    .get(apiAuth1)
                    .expect('Content-type', /json/)
                    .end(function(err, res) {
                        var me = res.body;
                        assert.equal(true, !res.body.err);
                        assert.equal(returnedUser.name, me.name);
                        assert.equal(false, 'password' in me);  // server removed password from object for security

                        var apiAuth2 = testConfig.apiLogout;
                        server  // Logout
                            .get(apiAuth2)
                            .end(function(err, res) {
                                assert.equal(302, res.status);
                                var apiAuth3 = testConfig.apiMe;
                                server  // If log out, server will return an object which contains nothing
                                    .get(apiAuth3)
                                    .expect('Content-type', /json/)
                                    .end(function(err, res) {
                                        assert.equal(null, res.body.name);
                                        done();
                                    });
                            });
                    });
            });
    });

});