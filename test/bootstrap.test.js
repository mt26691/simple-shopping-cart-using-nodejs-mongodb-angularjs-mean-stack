var testConfig = require('./testConfig');

var app = require('../app');
var http = require('http');
var server;

before(function (done) {
    app.set('port', 3000);
    server = http.createServer(app);
    server.listen(3000);
    done();

});

after(function (done) {
    server.close();
    done();
});
