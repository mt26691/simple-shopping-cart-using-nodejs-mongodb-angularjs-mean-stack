SimpleBlogApp.controller('registerController', ['$scope', 'Account'
    , function($scope, Account) {
        //store init form base data
        $scope.formRegister = { name: "", email: "", password: "" };
        $scope.isSuccess = false;
        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                //register
                Account.register($scope.formRegister, function callback(data) {
                    if (data.err) {
                        $scope.isSuccess = false;
                        $scope.msg = data.msg;
                    }
                    else {
                        $scope.msg = "";
                        $scope.isSuccess = data.isSuccess;
                    }
                });
            }
        }
    }]);

