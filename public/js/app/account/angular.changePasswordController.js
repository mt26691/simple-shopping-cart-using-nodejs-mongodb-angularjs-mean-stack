//changepassword form, change-password.html
SimpleBlogApp.controller('changePasswordController', ['$scope', 'Account'
    , function($scope, Account) {
        //store init form base data
        $scope.changePasswordForm = {};

        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                Account.changePassword($scope.changePasswordForm, function callback(data) {
                    if (data.err) {
                        $scope.msg = data.msg;
                        $scope.isPasswordChange = false;
                    }
                    else {
                        $scope.msg = "";
                        $scope.isPasswordChange = true;
                    }
                });

            }
        }
    }]);
