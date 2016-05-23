
//comment.html
SimpleBlogApp.controller('commentController', ['$scope', 'Comment', 'toastr',
    function($scope, Comment, toastr) {
        //not display new edit form
        $scope.isDisplayForm = false;
        $scope.search = { keyword: "", isActive: "" };

        //update
        $scope.edit = function(id, form) {
            //clear form dirty state, error message
            form.$setPristine();
            form.$setUntouched();

            Comment.get({ "id": id }, function(item) {
                $scope.newEditForm = item;
                $scope.newEditForm.oldImageUrl = item.imageUrl;
                $scope.newEditForm.isActive === true ? $scope.newEditForm.isActive = "1" : $scope.newEditForm.isActive = "0";
                $scope.isDisplayForm = true;
                $scope.err = false;
                $scope.msg = "";
            });
        }

        //delete
        $scope.delete = function(id) {
            Comment.delete({ "id": id }, function(result) {
                if (result.err) {
                    toastr.error(result.msg);
                }
                else {
                    toastr.success(result.msg);
                    $scope.query();
                }
            });
        }

        $scope.submitForm = function(isFormValid) {
            if (isFormValid) {
                $scope.newEditForm.isActive === "1" ? $scope.newEditForm.isActive = true : $scope.newEditForm.isActive = false;
                Comment.save($scope.newEditForm, function(res) {
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
                        toastr.success(res.msg);
                        //update list item
                        $scope.query();
                    }
                });
            }
        }

        //Pagination Setup
        $scope.currentPage = 1;

        $scope.query = function query() {
            var queryData = { "page": $scope.currentPage, "keyword": $scope.search.keyword, "isActive": $scope.search.isActive };
            Comment.get(queryData, function callback(res) {
                $scope.listItem = res.data;
                $scope.totalItems = res.count;
            });
        };

        //get chapter list and row count, this is also the search method
        $scope.query();

    }]);
