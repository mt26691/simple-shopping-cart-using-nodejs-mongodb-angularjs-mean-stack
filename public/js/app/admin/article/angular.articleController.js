
SimpleBlogApp.controller('articleController', ['$scope', '$http', 'config', 'Article', 'toastr',
    function ($scope, $http, config, Article, toastr) {
        //not display new edit form
        $scope.isDisplayForm = false;
        $scope.search = { keyword: "", isActive: "" };

        //create
        $scope.addNew = function (form) {
            $scope.newEditForm = { name: "",  description: "", image: {}, oldImage:{} };
            $scope.isDisplayForm = true;
            //clear form dirty state, error message
            form.$setPristine();
            form.$setUntouched();
            $scope.err = false;
            $scope.msg = "";
        };
        
        //update
        $scope.edit = function (id, form) {
            //clear form dirty state, error message
            form.$setPristine();
            form.$setUntouched();
            $scope.newEditForm = { name: "",  description: "", image: {}, oldImage:{} };
            Article.get({id:id}, function (item) {
                $scope.newEditForm = item;
                $scope.newEditForm.oldImage = item.image;
                $scope.newEditForm.isActive === true ? $scope.newEditForm.isActive = "1" : $scope.newEditForm.isActive = "0";
                $scope.isDisplayForm = true;
                $scope.err = false;
                $scope.msg = "";
                $scope.firstLoad = true;
            });
        }

        //delete
        $scope.delete = function (id) {
            Article.delete({id:id}, function (result) {
                if (result.err) {
                    toastr.error(result.msg);
                }
                else {
                    toastr.success(result.msg);
                    $scope.query();
                }
            });
        }

        $scope.submitForm = function (isFormValid) {
            if (isFormValid) {
                $scope.newEditForm.isActive === "1" ? $scope.newEditForm.isActive = true : $scope.newEditForm.isActive = false;
                Article.save($scope.newEditForm, function (res) {
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
                        toastr.success('Article saved.');
                        //update list item
                        $scope.query();
                    }
                });
            }
        }

        //Pagination Setup
        $scope.currentPage = 1;

        //query Article
        $scope.query = function () {
            var queryData = {
                    "page": $scope.currentPage, "keyword": $scope.search.keyword, "isActive": $scope.search.isActive
                };
            Article.get(queryData,
                function (res) {
                    $scope.listItem = res.data;
                    $scope.totalItems = res.count;
                });
        };

        $scope.query();

        $scope.upload = function (file, event, flow) {
            var fd = new FormData();
            fd.append('userPhoto', file[0].file);
            //multipart form
            $http.post(config.apiUploadArticleImage, fd, {
              transformRequest:angular.identity,
              headers:{'Content-Type': undefined}})
                .then(function onSuccess(uploadFileInfo) {
                    if(uploadFileInfo.data.error){
                       alert("error while uploading file");
                    }
                    else{
                        var main = '/images/main/'+uploadFileInfo.data.fileName;
                        var mid = '/images/mid/'+uploadFileInfo.data.fileName;
                        var thumb = '/images/thumb/'+uploadFileInfo.data.fileName;
                        $scope.newEditForm.image = {main:main,mid:mid,thumbnail:thumb};
                        $scope.firstLoad = false;
                    }
                });
        }
        
        $scope.removeImage = function(){
             $scope.newEditForm.image = {};
             if($scope.newEditForm.id)
             {
                 $scope.firstLoad = true;
             }
        }
        $scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
            event.preventDefault();//prevent file from uploading
        });
        
    }]);
