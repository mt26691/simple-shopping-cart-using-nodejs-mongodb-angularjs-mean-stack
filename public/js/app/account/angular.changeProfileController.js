
//controler for change-profile.html
SimpleBlogApp.controller('changeProfileController', ['$scope', 'Account',
    function($scope,  Account) {
        //store init form base data
        $scope.changeProfileForm = {};
        
        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                Account.changeProfile($scope.changeProfileForm, function callback(data) {
                    if (data.err) {
                        $scope.msg = data.msg;
                        $scope.isChanged = false;
                    }
                    else {
                        $scope.msg = data.msg;;
                        $scope.isChanged = true;
                    }
                });

            }
        }
    }]);
