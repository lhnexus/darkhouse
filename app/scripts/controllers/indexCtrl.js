/**
 * Created by VinceZK on 9/11/14.
 */
var indexControllers = angular.module('indexControllers',[]);

indexControllers.controller('indexCtrl', ['$scope', '$rootScope',
    function($scope,$rootScope){
        //Initialize global objects;
        $rootScope.navBarURL = null;
        $rootScope.currentUser = null;
        $rootScope.alerts = [];
        $rootScope.currentError = '';
        $rootScope.isCollapsed = true;

        $scope.closeAlert = function(index){
            $rootScope.alerts.splice(index, 1);
        }
}])

indexControllers.controller('navBarCtrl', ['$rootScope', '$scope','$state', 'auth',
    function($rootScope, $scope,$state,auth){
    $scope.logout = function(){
        auth.logout(function(err){
            if(err){
                $rootScope.currentError =
                {
                    errorName : err.data,
                    errorStatus: err.status,
                    errorStack: err.statusText
                },
                $state.go('error');
            }else{
                $state.go('login');
            }
        })
    }
}])

indexControllers.controller('welcomeCtrl',['$scope', '$rootScope',
    function($scope,$rootScope){
    //$scope.username = $rootScope.currentUser.USER_NAME;
}])

