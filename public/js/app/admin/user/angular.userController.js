
//users.html
SimpleBlogApp.controller('userController', ['$scope', 'User', 'toastr',
    function($scope, User, toastr) {
        //not display new edit form
        $scope.newEditForm = null;

        $scope.search = { keyword: "" };

        //update
        $scope.edit = function(id, form) {
            //clear form dirty state, error message
            form.$setPristine();
            form.$setUntouched();
            User.get({ id: id }, function callback(user) {
                $scope.newEditForm = user;
                $scope.newEditForm.isActive === true ? $scope.newEditForm.isActive = "1" : $scope.newEditForm.isActive = "0";
            });
        }

        //delete
        $scope.delete = function(id) {
            User.delete({ "id": id }, function callback(res) {
                toastr.success('Xóa thành công', 'Thành công!');
            });
        }

        $scope.cancelEdit = function() {
            $scope.newEditForm = null;
        }

        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                User.save($scope.newEditForm, function callback(res) {
                    if (res.err) {
                        $scope.msg = res.msg;
                        $scope.err = true;
                        $scope.newEditForm.isActive === true ? $scope.newEditForm.isActive = "1" : $scope.newEditForm.isActive = "0";
                    }
                    else {
                        $scope.isDisplayForm = false;
                        //make edit form disappear
                        $scope.newEditForm = null;
                        $scope.msg = "";
                        $scope.err = false;
                        toastr.success('User saved.');
                        //update list item
                        $scope.query();
                    }
                });
            }
        }

        //Pagination Setup
        $scope.currentPage = 1;

        //query subject
        $scope.query = function() {
            var queryData = {
                "page": $scope.currentPage, "keyword": $scope.search.keyword
            };
            User.get(queryData,
                function(res) {
                    $scope.listItem = res.data;
                    $scope.totalItems = res.count;
                });
        };

        $scope.query();
    }]);
