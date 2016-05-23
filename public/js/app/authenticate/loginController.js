SimpleBlogApp.controller('loginController', ['$scope', '$window', 'AuthApi',
    function($scope, $window, AuthApi) {
        //store init form base data
        $scope.formLogin = {};

        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                AuthApi.loginLocal($scope.formLogin, function callback(res) {
                    if (res.err) {
                        $scope.msg = res.msg;
                    }
                    else {
                        if (res.user.accessRight >= 8) {
                            $window.location.href = "/admin/home";
                        }
                        else {
                            $window.location.href = "/";
                        }
                    }

                });
            }
        }
    }]);