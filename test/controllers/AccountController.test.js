var assert = require('assert');
var supertest = require("supertest");
var testConfig = require('../testConfig');
var server = supertest.agent(testConfig.host + ":" + testConfig.port);
var apiURL = testConfig.apiAccountUrl;
var initData = require('../initData');

/*
* See /api/controllers/v1/AccountController.js  
* and /api/routes/accountRoutes.js for more details
*/
describe('Account Controller test', function () {
    var newUsers = [];
    var oldUsers = [];

    beforeEach(function (done) {
        initData(function (returnData) {
            newUsers = returnData.newUsers;
            oldUsers = returnData.oldUsers;
            done();
        });
    });
    
    it('should let client register new user with email and password', function (done) {
        var registerApiUrl = testConfig.apiRegister;

        var newUser = {
            name: 'testRegisterUser',
            email: 'test_register_user@gmail.com',
            password: '123456'
        };

        server  // Register new user
            .post(registerApiUrl)
            .send(newUser)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                var returnedUser = res.body;
                // Logger.info(returnedUser);
                assert.equal(newUser.email, returnedUser.email);  // check email
                assert.equal(false, 'password' in returnedUser);  // server removed password from object for security
                done();
            });
    });

    it('should reject client registering with existing email (on system)', function (done) {
        var registerApiUrl = testConfig.apiRegister;
        var newUser1 = {
            name: "duplicate",
            email: 'newuser1@gmail.com',
            password: 'newuser1password'
        };
        var newUser2 = {
            name: "duplicate",
            email: 'newuser1@gmail.com',  // same email
            password: 'newuser2password'
        };

        server  // Register new user 1
            .post(registerApiUrl)
            .send(newUser1)
            .expect('Content-type', /json/)
            .end(function (err, res) {

                var returnedUser = res.body;
                // Logger.info(returnedUser);
                assert.equal(newUser1.email, returnedUser.email);  // check email
                assert.equal(false, 'password' in returnedUser);  // server removed password from object for security
                
                server  // Register new user 2 which has same email as user 1
                    .post(registerApiUrl)
                    .send(newUser2)
                    .expect('Content-type', /json/)
                    .end(function (err, res) {

                        assert.ok(res.body.err || res.body.error);  // Error because of email duplication
                        done();
                    });
            });
    });

    it('sends password resest to right email', function (done) {
        var api = apiURL + "/sendPasswordResetEmail";

        var userInfo = {
            email: newUsers[0].email
        };

        server
            .post(api)
            .send(userInfo)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                var returneUser = res.body;
                assert.equal(userInfo.email, returneUser.email);
                done();
            });
    });

    it('does not send  password resest to wrong email', function (done) {
        var api = apiURL + "/sendPasswordResetEmail";

        var userInfo = {
            email: 'wrongUser@gmail.com',
        };

        server  // Register new user
            .post(api)
            .send(userInfo)
            .expect('Content-type', /json/)
            .end(function (err, res) {

                assert.equal(true, res.body.err);
                done();
            });
    });

    it('return user info with right password reset token', function (done) {
        var api = apiURL + "/getResetPasswordData";

        var userInfo = {
            passwordResetToken: newUsers[0].passwordResetToken.value,
        };

        server  // Register new user
            .post(api)
            .send(userInfo)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                assert.equal(newUsers[0].email, res.body.email);
                done();
            });

    });

    it('not return user info with right  wrong password reset token', function (done) {
        var api = apiURL + "/getResetPasswordData";

        var userInfo = {
            passwordResetToken: "wrongtoken11111111111111111111111111"
        };

        server  // Register new user
            .post(api)
            .send(userInfo)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                assert.equal(true, res.body.err);
                done();
            });

    });

    it('not return user info with expried reset token', function (done) {
        var api = apiURL + "/getResetPasswordData";

        var info = {
            passwordResetToken: newUsers[4].passwordResetToken.value
        };

        server  // Register new user
            .post(api)
            .send(info)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                assert.equal(true, res.body.err);
                done();
            });

    });

    it('let user change password with right token', function (done) {
        var api = apiURL + "/resetPassword";

        var info = {
            passwordResetToken: newUsers[0].passwordResetToken.value,
            password: "demoBimBim"
        };

        server
            .post(api)
            .send(info)
            .expect('Content-type', /json/)
            .end(function (err, res) {
                assert.equal(newUsers[0].email, res.body.email);
                done();
            });
    });

    it('not let user change password with wrong token', function (done) {
        var api = apiURL + "/resetPassword";

        var info = {
            passwordResetToken: "wrongtoke1111111111112n",
            password: "demoBimBim"
        };

        server  // Register new user
            .post(api)
            .send(info)
            .expect('Content-type', /json/)
            .end(function (err, res) {

                assert.equal(true, res.body.err);
                done();
            });
    });

    it('not let user change password with expried token', function (done) {
        var api = apiURL + "/resetPassword";

        var info = {
            passwordResetToken: newUsers[4].passwordResetToken.value,
            password: "demoBimBim"
        };

        server  // Register new user
            .post(api)
            .send(info)
            .expect('Content-type', /json/)
            .end(function (err, res) {

                assert.equal(true, res.body.err);
                done();
            });
    });

    it('let user change their password', function (done) {
        server  // login
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // login using email, password
            .expect('Content-type', /json/)
            .end(function (err, res) {
                var changePasswordData = { currentPassword: oldUsers[0].password, password: "NewPassword1" };
                server
                    .post(testConfig.apiChangePassword)
                    .send(changePasswordData)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function (err, res) {

                        var returnedObj = res.body;
                        assert.equal(false, returnedObj.err);
                        //get me with new access token
                        var apiAuth1 = testConfig.apiAuthUrl + '/me';
                        server  // Get me
                            .get(apiAuth1)
                            .expect('Content-type', /json/)
                            .end(function (err, res) {
                                assert.equal(oldUsers[0].email, res.body.email);
                                done();
                            });
                    });
            });
    });

    it('should let active user login, change his profile', function (done) {
        server  // login
            .post(testConfig.apiLogin)
            .send(oldUsers[0])  // login using email, password [0] normal user, 
            .expect('Content-type', /json/)
            .end(function (err, res) {

                var returnedUser = res.body.user;
                var updatingUser = returnedUser;
                updatingUser.name = "New Name";

                server
                    .post(testConfig.apiChangeProfile)
                    .send(updatingUser)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.equal(false, res.body.err);
                        assert.equal(true, res.body.msg.length > 10);
                        done();
                    });
            });
    });

});