//CONTROLLER
SimpleBlogApp.controller('masterController', ['$scope', '$location', '$rootScope', '$route',
    function($scope, $location, $rootScope, $route) {

        // Define user empty data :/
        $scope.user = {};

        $scope.isCurrentPath = function(path) {
            return $location.path() == path;
        };
        $scope.menuItems = [
            {
                name: 'Home',
                url: '/admin/',
                title: 'Home',
                iconClass: 'fa fa-dashboard fa-fw'
            },
            {
                name: 'Dashboard',
                url: '/admin/dashboard',
                title: 'Dashboard.',
                iconClass: 'fa fa-dashboard fa-fw',
                accessRight: 9
            },
            {
                name: 'User',
                url: '/admin/user',
                title: 'User Management.',
                iconClass: 'fa fa-users fa-fw',
                accessRight: 9
            },
            {
                name: 'Article',
                url: '/admin/article',
                title: 'Article.',
                iconClass: 'fa fa-book fa-fw',
                accessRight: 8
            },
            {
                name: 'Comment',
                url: '/admin/comment',
                title: 'Comment.',
                iconClass: 'fa fa-comment-o fa-fw',
                accessRight: 8
            },
        ];

        $scope.navClass = function(page) {
            var currentRoute = $location.path() || 'home';
            return page === currentRoute ? 'active' : '';
        };

        $scope.currentUser = $rootScope.currentUser;

    }]);
