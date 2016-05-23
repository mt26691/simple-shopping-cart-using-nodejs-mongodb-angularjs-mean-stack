SimpleBlogApp.controller('articleDetailsController', ['$scope', '$routeParams', 'HomeApi', '$rootScope', 'Comment',
    function($scope, $routeParams, HomeApi, $rootScope, Comment) {
        var nameUrl = $routeParams.nameUrl;
        var id = $routeParams.id;
        $scope.err = false;
        $scope.isAuthenticated = $rootScope.currentUser != null;

        $scope.comment = { content: "", article: null };
        HomeApi.getArtcileDetails({ nameUrl: nameUrl, id: id },
            function callback(res) {
                if (res.err) {
                    $scope.err = true;
                    $scope.msg = res.msg;
                }
                else {
                    $scope.article = res.article;
                    $scope.comment.article = $scope.article.id;
                    $scope.recentArticles = res.recentArticles;
                    $scope.page.setTitle($scope.article.name);
                    $scope.comments = res.comments;
                }
            });
        $scope.submitComment = function submitComment() {
            if ($scope.comment.content != '') {
                //submit comment for approve
                Comment.save($scope.comment, function callback(data) {
                    if (data.err == false) {
                        $scope.comment = '';
                        $scope.msg = '';
                    }
                    else {
                        $scope.msg = data.msg;
                    }
                });
            }
        }
    }]);
