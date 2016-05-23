var apiServices = angular.module("api-services", []);

apiServices.factory("User", ["$resource", function($resource) {
    return $resource("/api/v1/admin/user/:id", {}, {});
}]);

apiServices.factory("DashBoard", ["$resource", function($resource) {
    return $resource("/api/v1/admin/dashboard/", {}, {});
}]);

apiServices.factory("Article", ["$resource", function($resource) {
    return $resource("/api/v1/admin/article/:id", {}, {});
}]);

apiServices.factory("Chapter", ["$resource", function($resource) {
    return $resource("/api/v1/admin/chapter/:id", {}, {
        "getCurrentOrder": {
            url: "/api/v1/admin/chapter/getCurrentOrder/:subject",
            method: "GET"
        },
        "source": {
            url: "/api/v1/admin/chapter/source/:subject",
            method: "GET"
        },
    });
}]);

apiServices.factory("Comment", ["$resource", function($resource) {
    return $resource("/api/v1/admin/comment/:id", {}, {});
}]);


apiServices.factory("MailHandler", ["$resource", function($resource) {
    return $resource("/api/v1/admin/sendEmail/", {}, {});
}]);

apiServices.factory("UploadImage", ["$resource", function($resource) {
    return $resource("/uploadImage", {}, {});
}]);

apiServices.factory("AuthApi", ["$resource", function($resource) {
    return $resource("/api/v1/auth", {}, {
        "loginLocal": {
            url: "/api/v1/auth/login/local",
            method: "POST"
        },
    });
}]);

//Account
apiServices.factory("Account", ["$resource", function($resource) {
    return $resource("/api/v1/account/:action", {}, {
        "register": {
            method: "POST",
            params: { action: "register" }
        },
        "sendPasswordResetEmail": {
            method: "POST",
            params: { action: "sendPasswordResetEmail" }
        },
        "getProfile": {
            method: "GET",
            params: { action: "getProfile" }
        },
        "changePassword": {
            method: "POST",
            params: { action: "changePassword" }
        },
        "changeProfile": {
            method: "POST",
            params: { action: "changeProfile" }
        },
        "resetPassword": {
            method: "POST",
            params: { action: "resetPassword" }
        },
        "getResetPasswordData": {
            method: "POST",
            params: { action: "getResetPasswordData" }
        },
        "getAll": {
            method: "GET",
            isArray: true,
            params: { action: "GetAll" }
        },
        "getByServiceId": {
            method: "GET",
            isArray: true,
            params: { action: "GetByServiceId" }
        },
        "me": {
            method: "GET",
            params: { action: "me" }
        }

    });
}]);

apiServices.factory("HomeApi", ["$resource", function($resource) {
    return $resource("/api/v1/home/", {}, {
        "search": {
            url: "/api/v1/home/search",
            method: "GET"
        },
        "getArtcileDetails": {
            url: "/api/v1/home/:nameUrl/:id/",
            method: "GET"
        },
    });
}]);
