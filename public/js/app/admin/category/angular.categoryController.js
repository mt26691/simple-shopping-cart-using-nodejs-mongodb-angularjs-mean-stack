
//category.html
SimpleBlogApp.controller('categoryController', ['$scope', 'Category', 'toastr',
    function ($scope, Category, toastr) {
        //not display new edit form
        $scope.newEditForm = null;

        $scope.search = { keyword: "" };

        //update
        $scope.edit = function (id, form) {
            //clear form dirty state, error message
            form.$setPristine();
            form.$setUntouched();
            Category.get({ id: id }, function callback(category) {
                $scope.newEditForm = category;
                $scope.newEditForm.isActive === true ? $scope.newEditForm.isActive = "1" : $scope.newEditForm.isActive = "0";
            });
        }


        //create
        $scope.addNew = function (form) {
            $scope.newEditForm = { id: null, name: "", description: "", image: {}, oldImage: {} };
            $scope.isDisplayForm = true;
            //clear form dirty state, error message
            form.$setPristine();
            form.$setUntouched();
            $scope.err = false;
            $scope.msg = "";
        };

        //delete
        $scope.delete = function (id) {
            Category.delete({ "id": id }, function callback(res) {
                if (res.err) {
                    toastr.error(res.msg, 'Thất bại!');
                }
                else {
                    toastr.success(res.msg, 'Thành công!');
                }

            });
        }

        $scope.cancelEdit = function () {
            $scope.newEditForm = null;
        }

        $scope.submitForm = function (isFormValid) {
            if (isFormValid) {
                Category.save($scope.newEditForm, function callback(res) {
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
                        toastr.success('Category saved.');
                        //update list item
                        $scope.query();
                    }
                });
            }
        }

        //Pagination Setup
        $scope.currentPage = 1;

        //query subject
        $scope.query = function () {
            var queryData = {
                "page": $scope.currentPage, "keyword": $scope.search.keyword
            };
            Category.get(queryData,
                function (res) {
                    debugger;
                    $scope.listItem = res.data;
                    $scope.totalItems = res.count;
                });
        };

        $scope.query();
    }]);
