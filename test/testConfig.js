module.exports = {
    testDB: 'hocdai-mean-test',
    port: '3000',
    host: 'http://localhost',
    //link for Authcontroller
    apiAuthUrl: '/api/v1/auth',
    apiLogin:'/api/v1/auth/login/local',
    apiLogout:'/api/v1/auth/logout',
    apiMe:'/api/v1/auth/me',
    //link for AccountController
    apiAccountUrl: '/api/v1/account',
    apiRegister:'/api/v1/account/register',
    //article
    apiArticleUrl: '/api/v1/admin/article',
    //apiCommenttUrl
    apiCommenttUrl:'/api/v1/admin/comment',
    apiUserUrl: '/api/v1/admin/user',
    apiSendEmailUrl: '/api/v1/admin/sendEmail',
    
    apiChangeProfile: '/api/v1/account/changeProfile',
    apiChangePassword:'/api/v1/account/changePassword',
    homeApi:'/api/v1/home/',
    lectureDetailsApi:'/api/v1/home/lectureDetails',
    itemsPerPage:5,
    //get => count, paging data
    // post => update + create
    
};