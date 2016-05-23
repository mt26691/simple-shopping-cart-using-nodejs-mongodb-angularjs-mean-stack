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
describe('Home Controller Test', function() {
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

    //search method in /api/controllers/v1/HomeController.js  
    it('user go to home page and see all active article', function(done) {
        server
            .get(apiURL)
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                assert.equal(5, res.body.articles.length);
                //7 active articles
                assert.equal(7, res.body.total);
                done();
            });

    });

     //search method in /api/controllers/v1/HomeController.js  
    it('user go to page 2 and see the articles in page 2', function(done) {
        server
            .get(apiURL + "?page=2")
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200); // OK
                assert.equal(2, res.body.articles.length);
                assert.equal(7, res.body.total);
                done();
            });

    });

    //get method in /api/controllers/v1/HomeController.js  
    it('user can see active articles details', function(done) {
        server
            .get(testConfig.homeApi + newArticles[1].nameUrl + "/" + newArticles[1].id)
            .expect('Content-type', /json/)
            .end(function(err, res) {
                //compare returned data
                assert.equal(res.body.article.nameUrl, newArticles[1].nameUrl);
                assert.equal(false, res.body.err);
                done();
            });
    });

     //get method in /api/controllers/v1/HomeController.js  
    it('user can not see inactive articles details', function(done) {
        server
            .get(testConfig.homeApi + newArticles[1].nameUrl + "/" + newArticles[7].id)
            .expect('Content-type', /json/)
            .end(function(err, res) {
                //compare returned data
                assert.equal(null, res.body.article);
                done();
            });
    });

    //get method in /api/controllers/v1/HomeController.js  
    it('user can not see lecture with wrong url', function(done) {
        server
            .get(testConfig.homeApi + newArticles[1].nameUrl + "/")
            .expect('Content-type', /json/)
            .end(function(err, res) {
                done();
            });
    });

    after(function(done) {
        done();
    });

});