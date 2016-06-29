/**
 * gulp/pipeline.js
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 */

// Path to public folder
var tmpPath = './public/';

// CSS files to inject in order
var cssFilesToInject = [
    //bootstrap 3.3.5
    'stylesheets/bootstrap.min.css',
    'stylesheets/style.css',
    'stylesheets/angular-toastr.css',
    'stylesheets/font-awesome.min.css',
    'stylesheets/site*.css',
];

var cssFilesToInjectAdmin = [
    //bootstrap 3.3.5
    'stylesheets/bootstrap.min.css',
    'stylesheets/style.css',
    'stylesheets/angular-toastr.css',
    'stylesheets/font-awesome.min.css',
    'stylesheets/admin*.css',
];

// Client-side javascript files to inject in order
var jsFilesToInject = [
    //bootstrap
    'js/bootstrap.min.js',
    'js/lib/*.js',
    'js/bower_components/**/*.min.js',
    //external angular lib
    'js/angular/*.js',
    //our app
    'js/app/angularApp.js',
    'js/app/**/*.js'

    // 'js/**/*.js',
];

// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(transformPath);
module.exports.cssFilesToInjectAdmin = cssFilesToInjectAdmin.map(transformPath);

module.exports.jsFilesToInject = jsFilesToInject.map(transformPath);

var totalInject = cssFilesToInject.concat(jsFilesToInject);
var totalInjectAdmin = cssFilesToInjectAdmin.concat(jsFilesToInject);

module.exports.injectFile = totalInject.map(transformPath);
module.exports.injectFileAdmin = totalInjectAdmin.map(transformPath);

// Transform paths relative to the "assets" folder to be relative to the public
// folder, preserving "exclude" operators.
function transformPath(path) {
    return (path.substring(0, 1) == '!') ? ('!' + tmpPath + path.substring(1)) : (tmpPath + path);
}
