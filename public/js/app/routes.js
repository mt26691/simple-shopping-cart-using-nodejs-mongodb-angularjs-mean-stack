//ROUTES
SimpleBlogApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    window.routes = {
        '/':
        {
            title: "Simple blog using nodejs angularjs mongodb",
            templateUrl: '/templates/home.html',
            controller: 'homeController'
        },
        '/page-:page':
        {
            title: "Simple blog using nodejs angularjs mongodb",
            templateUrl: '/templates/home.html',
            controller: 'homeController'
        },
        '/admin/dashboard':
        {
            templates: "<div></div>",
            controller: 'userController',
            role: 'admin'
        },
        '/admin/user':
        {
            templateUrl: '/templates/admin/user/users.html',
            controller: 'userController',
            role: 'admin'
        },
        '/admin/article':
        {
            templateUrl: '/templates/admin/article/article.html',
            controller: 'articleController',
            role: 'admin'
        },
        '/admin/comment':
        {
            templateUrl: '/templates/admin/comment/comment.html',
            controller: 'commentController',
            role: 'admin'
        },
        '/tai-khoan/:userId?':
        {
            title: 'Tài khoản',
            templateUrl: '/templates/account/userProfile.html',
            controller: 'getUserProfileController',
        },
        '/register':
        {
            title: 'register',
            templateUrl: '/templates/authenticate/register.html',
            controller: 'registerController',
        },
        '/log-in':
        {
            title: 'Log in',
            templateUrl: '/templates/authenticate/login.html',
            controller: 'loginController',
        },
        '/forgot-password':
        {
            title: 'Forgot password',
            templateUrl: '/templates/account/forgot-password.html',
            controller: 'forgotPasswordController',
        },
        '/change-password':
        {
            title: 'Change password',
            templateUrl: '/templates/account/change-password.html',
            controller: 'changePasswordController',
        },
        '/change-profile/':
        {
            title: 'Change profile',
            templateUrl: '/templates/account/change-profile.html',
            controller: 'changeProfileController',
        },
        '/reset-password/:passwordResetToken?':
        {
            title: 'Reset password',
            templateUrl: '/templates/account/reset-password.html',
            controller: 'resetPasswordController'
        },
        '/about-us':
        {
            title: 'About us',
            templateUrl: '/templates/infor/about-us.html',
        },
        '/policies':
        {
            title: 'About us',
            templateUrl: '/templates/infor/policies.html',
        },
        '/user/:userId':
        {
            title: 'User',
            templateUrl: '/templates/account/userProfile.html',
            controller: 'getUserProfileController'
        },
        '/:nameUrl/:id':
        {
            templateUrl: '/templates/article_details.html',
            controller: 'articleDetailsController'
        }
    };

    for (var path in window.routes) {
        $routeProvider.when(path, window.routes[path]);
    }

    $routeProvider.otherwise({ redirectTo: '/log-in' });
    $locationProvider.html5Mode(true);

}]);