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
    'stylesheets/tree-view.min.css',
];

// Client-side javascript files to inject in order
var jsFilesToInject = [
    //bootstrap
    'js/bootstrap.min.js',
    
//angular 1.4.8 stable version
    'js/angular/angular.min.js',
    'js/angular/angular-route.min.js',
    'js/angular/angular-resource.min.js',
//angular bootstrap 0.14.3
    'js/angular/ui-bootstrap-tpls-0.14.3.min.js',
    'js/angular/*.js',
    'js/app/angularApp.js',
// Dependencies like jQuery, or Angular are brought in here

// All of the rest of your client-side js files
// will be injected here in no particular order.
      'js/app/modules/*.js',
      'js/app/*.js',
      
     'js/app/factory/*.js',
     'js/app/home/*.js',
     'js/app/authenticate/*.js',
     'js/**/*.js',
    //  'js/app/directives/*.js'
    // Use the "exclude" operator to ignore files
    // '!js/ignore/these/files/*.js'

];

// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(transformPath);
module.exports.jsFilesToInject = jsFilesToInject.map(transformPath);

var totalInject = cssFilesToInject.concat(jsFilesToInject);

module.exports.injectFile = totalInject.map(transformPath);
// Transform paths relative to the "assets" folder to be relative to the public
// folder, preserving "exclude" operators.
function transformPath(path) {
    return (path.substring(0, 1) == '!') ? ('!' + tmpPath + path.substring(1)) : (tmpPath + path);
}
