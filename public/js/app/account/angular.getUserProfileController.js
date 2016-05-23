SimpleBlogApp.controller('getUserProfileController', ['$scope', '$routeParams', 'Account',
    function($scope, $routeParams, Account) {
        Account.getProfile({ userId: $routeParams.userId }, function callback(data) {
            $scope.err = data.err;
            $scope.user = data.user;
        });
    }]);
