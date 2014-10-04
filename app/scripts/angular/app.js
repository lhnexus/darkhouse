/**
 * Created by VinceZK on 9/11/14.
 */
'use strict';

angular.module('darkhouse', [
    'ui.router',
    'ngResource',
    'ngCookies',
    'ui.bootstrap',
    'http-auth-interceptor',
    'dkDirectives',
    'indexControllers',
    'loginCtrl',
    'introControllers',
    'underscore'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider
        .when('app/welcome', 'welcome')
        .when('login', 'login')
        .otherwise('/app/introduce');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: '/views/login.html',
            controller: 'loginCtrl',
            onEnter:function($rootScope){
                $rootScope.navBarURL = null;
            }
        })
        .state('login.renewPWD', {
            url: '/renewPWD',
            templateUrl: '/views/renewPWD.html',
            onEnter:function($rootScope){
                $rootScope.navBarURL = null;
            }
        })
        .state('welcome', {
            url: '/app/welcome',
            templateUrl: '/views/welcome.html',
            controller: 'welcomeCtrl'
        })
        .state('introduce',{
            url: '/app/introduce',
            templateUrl: '/views/introduce.html',
            controller: 'introduceCtrl',
            onEnter:function($rootScope){
                $rootScope.navBarURL = 'views/navBar.html';
            }
        })
        .state('error',{
            url: '/error',
            templateUrl: '/views/app_error.html'
        })

    $locationProvider.html5Mode(true);
}])
.run(['$state','$rootScope', '$location','auth',
        function($state, $rootScope, $location, auth){
        //watching the value of the currentUser variable.
        $rootScope.$watch('currentUser', function(currentUser) {
            // if no currentUser and on a page that requires authorization then try to update it
            // will trigger 401s if user does not have a valid session
            if (!currentUser && (['/','/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
                auth.currentUser(function(err){
                    if(err){
                      $rootScope.navBarURL = 'views/navBar.html';
                      $rootScope.currentError =
                      {errorStatus:'',
                       errorName:err.message,
                       errorStack:'Some errors occurred in server side, contact administrator!' };
                      $state.go('error');
                    }
                });
            }
        });

         // On catching 401 errors, redirect to the login page.
        $rootScope.$on('event:auth-loginRequired', function() {
            $rootScope.navBarURL = null;
            $rootScope.alerts.push({type:'warning',
                msg:"You haven't logged in, or the session is expired! Please login again!"});
            $state.go('login');
        });

        // On catching loginConfirmed
        $rootScope.$on('event:auth-loginConfirmed', function() {
            $rootScope.navBarURL = 'views/navBar.html';
        });

    }])