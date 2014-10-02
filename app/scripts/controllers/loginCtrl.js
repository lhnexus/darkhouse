/**
 * Created by VinceZK on 9/14/14.
 */
var loginCtrl = angular.module('loginCtrl',[]);

// create angular controller and pass in $scope and $http
loginCtrl.controller('loginCtrl',['$scope','$rootScope','$state','auth',
    function($scope,$rootScope,$state,auth){
    $scope.SignIn = 'Sign In';
    $scope.focusPWD1 = false;
    // create a blank object to hold our form information
    // $scope will allow this to pass between controller and view
    $scope.formData = {
        email : 'zklee@hotmail.com',
        password : '',
        password1 : '',
        password2 : ''
    };

    // process the form
    $scope.processLogin = function() {
        auth.login_resource({
            username: $scope.formData.email,
            password: $scope.formData.password
        },
        function(data){
          $scope.errorEmail = data.otherInfo.errorEmail;
          $scope.errorPassword = data.otherInfo.errorPassword;
          if(data.otherInfo.message == 'renewPWD'){
              $scope.SignIn = 'Save & Sign In';
              $scope.focusPWD1 = true;
              $state.go('login.renewPWD');
              return;
          }

          if(!data.userInfo){
              $scope.errorPassword = data.errorInfo;
              return;
          }

          $rootScope.currentUser = auth.parseUserInfo(data.userInfo);
          $rootScope.alerts.splice(0,$rootScope.alerts.length);
          $rootScope.navBarURL = 'views/navBar.html';
          $state.go('introduce');


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
    }
}]);
