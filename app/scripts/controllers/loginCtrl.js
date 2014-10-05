/**
 * Created by VinceZK on 9/14/14.
 */
var loginCtrl = angular.module('loginCtrl',[]);

// create angular controller and pass in $scope and $http
loginCtrl.controller('loginCtrl',['$scope','$rootScope','$state','auth','authService',
    function($scope,$rootScope,$state,auth,authService){
    $scope.SignIn = 'Sign In';
    $scope.focusPWD1 = false;
    // create a blank object to hold our form information
    // $scope will allow this to pass between controller and view
    $scope.formData = {
        email : '',
        password : '',
        password1 : '',
        password2 : ''
    };

    /**
     * Validate the form data
     */
    $scope.validateFormData = function(){
        if($scope.formData.password1 != $scope.formData.password2 ||
            $scope.formData.password1 == $scope.formData.password){
            return false;
        }
        else{
            return true;
        }
    }

    /**
     * submit the loginform
     */
    $scope.processLogin = function() {
        if($scope.SignIn === 'Sign In'){
            auth.login_resource({
                    username: $scope.formData.email,
                    password: $scope.formData.password
                },
                function(data){
                    $scope.errorEmail = data.otherInfo.errorEmail;
                    $scope.errorPassword = data.otherInfo.errorPassword;
                    if(!data.userInfo || data.userInfo.length == 0){
                        $scope.errorPassword = $scope.errorPassword || data.errorInfo;
                        return;
                    }

                    $rootScope.currentUser = auth.parseUserInfo(data.userInfo);
                    $rootScope.alerts.splice(0,$rootScope.alerts.length);
                    authService.loginConfirmed();
                    if(data.otherInfo.message == 'renewPWD'){
                        $scope.SignIn = 'Save & Sign In';
                        $scope.focusPWD1 = true;
                        $state.go('login.renewPWD');
                    }else{
                        //$rootScope.navBarURL = 'views/navBar.html';
                        $state.go('introduce');
                    }
                },
                function (err) {
                    $rootScope.currentError =
                    {
                        errorName : err.statusText,
                        errorStatus: err.status,
                        errorStack: err.message
                    }
                    $state.go('error');
                }
            )
        }else{
            auth.renewPWD({
                    email: $scope.formData.email,
                    password: $scope.formData.password1
                },
                function(){
                    $scope.SignIn = 'Sign In';
                    $scope.focusPWD1 = false;
                    $rootScope.navBarURL = 'views/navBar.html';
                    $state.go('introduce');
                },
                function(err){
                    $rootScope.currentError =
                    {
                        errorName : err.data,
                        errorStatus: err.status,
                        errorStack: err.message
                    }
                    $state.go('error');
                })
        }
    }
}]);
