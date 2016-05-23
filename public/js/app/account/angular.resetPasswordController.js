
//get-new-password.html
SimpleBlogApp.controller('resetPasswordController', ['$scope', 'Account', '$routeParams',
    function($scope, Account, $routeParams) {
        //store init form base data
        $scope.forgotPasswordForm = { password: "", repeatPassword: "" };
        
        $scope.submitForgotPasswordForm = function(isFormValid) {
            if (isFormValid) {
                var postData = { passwordResetToken: $routeParams.passwordResetToken, password: $scope.forgotPasswordForm.password };
                Account.resetPassword(postData, function callback(data) {
                    if (data.error) {
                        $scope.notFoundUser = true;
                    }
                    else {
                        $scope.passwordChangedSuccess = true;
                    }
                });
            }
        }
        
        Account.getResetPasswordData({ passwordResetToken: $routeParams.passwordResetToken }, function callback(data) {
            if (data.err) {
                $scope.notFoundUser = true;
            }
            else {
                $scope.err = false;
                $scope.email = data.email;
            }
        });
    }]);
