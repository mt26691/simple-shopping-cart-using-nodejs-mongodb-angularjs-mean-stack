
SimpleBlogApp.controller('forgotPasswordController', ['$scope',  'Account',
    function($scope, Account) {
        //store init form base data
        $scope.forgotPasswordForm = { email: "" };

        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                Account.sendPasswordResetEmail($scope.forgotPasswordForm, function callback(data) {
                    if (data.err) {
                        $scope.msg = data.msg;
                    }
                    else {
                        $scope.msg = "";
                        $scope.isEmailSent = true;
                        $scope.verifyEmail = data.email;
                    }
                });
            }
        }
    }]);
