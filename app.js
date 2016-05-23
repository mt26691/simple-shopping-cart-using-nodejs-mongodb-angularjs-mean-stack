var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//connect to database, you only need to connect to database one time only
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/simple-blog');

//route
var routes = require('./api/routes/index');
var users = require('./api/routes/userRoutes');
var auth = require('./api/routes/authRoutes');
var accountRoute = require('./api/routes/accountRoutes');
var adminUser = require("./api/routes/userRoutes");
var adminArticle = require("./api/routes/articleRoutes");
var homeApi = require("./api/routes/homeRoutes");
var uploadImageRoutes = require("./api/routes/uploadImageRoutes");
var adminComment = require("./api/routes/commentRoutes");

var app = express();
var async = require('async');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', "ejs");
//for html
app.set("view options", { layout: false });
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/account', accountRoute);
// //admin section
app.use('/api/v1/admin/user', adminUser);
app.use('/api/v1/admin/article', adminArticle);
app.use('/api/v1/admin/comment', adminComment);

app.use('/api/v1/admin/uploadImage', uploadImageRoutes);
app.use('/api/v1/home', homeApi);

app.use('/', routes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//set email template
require("email-templates")('./views/email', function (err, template) {
    if (err) { console.log("Fail to config views") };
    var mail = require("./api/config/MailConfig");
    mail.template = template;
});

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

module.exports = app;
