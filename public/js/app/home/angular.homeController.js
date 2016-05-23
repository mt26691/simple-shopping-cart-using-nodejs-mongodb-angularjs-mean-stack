//CONTROLLER
SimpleBlogApp.controller('masterHomeController', ['$scope', '$location',
    function($scope, $location) {
       
        $scope.searchForm = { key: "" };
        $scope.search = function() {
            if ($scope.searchForm.key != null && $scope.searchForm.key.length > 0) {
                $location.path('/tim-kiem').search('tuKhoa', $scope.searchForm.key).search("trang", null);
            }
        }
    }]);

//CONTROLLER
SimpleBlogApp.controller('homeController', ['$scope', 'HomeApi', '$routeParams', '$location',
    function($scope, HomeApi, $routeParams, $location) {
        $scope.totalItems = 0;
        $scope.paging = { currentPage: 1 };
        if ($routeParams.page != null && !isNaN($routeParams.page)) {
            $scope.paging.currentPage = parseInt($routeParams.page);
        }
        $scope.totalItems = 0;

        HomeApi.get({ page: $scope.paging.currentPage }, function callback(res) {
            $scope.articles = res.articles;
            $scope.totalItems = res.total;
        });

        $scope.pageChanged = function() {
            //change page
            $location.path('/page-' + $scope.paging.currentPage);
        };
    }]);
