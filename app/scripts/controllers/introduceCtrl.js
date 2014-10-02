/**
 * Created by VinceZK on 10/1/14.
 */
var introControllers = angular.module('introControllers',[]);

// create angular controller and pass in $scope and $http
introControllers.controller('introduceCtrl',['$scope', '$cookies',
    function($scope,$cookies){
        $scope.introSlice01 = 'views/intro_01.html';
        $scope.oneAtATime = true;
        //$scope.sessionCookie = $cookieStore.get('sessionID');
        $scope.sessionCookie = $cookies.sessionID;
        $scope.status = {
            open01: true,
            open02: false,
            open03: false,
            open04: false,
            open05: false,
            open06: false,
            open07: false,
            open08: false,
            open09: false
        };

        $scope.openAccordionGroup = function(index){
            switch (index){
                case 1:
                    $scope.status.open01 = true;
                    $scope.introSlice01 = 'views/intro_01.html';
                    break;
                case 2:
                    $scope.status.open02 = true ;
                    $scope.introSlice02 = 'views/intro_02.html';
                    break;
                case 3:
                    $scope.status.open03 = true;
                    $scope.introSlice03 = 'views/intro_03.html';
                    break;
                case 4:
                    $scope.status.open04 = true ;
                    $scope.introSlice04 = 'views/intro_04.html';
                    break;
                case 5:
                    $scope.status.open05 = true;
                    $scope.introSlice05 = 'views/intro_05.html';
                    break;
                case 6:
                    $scope.status.open06 = true ;
                    $scope.introSlice06 = 'views/intro_06.html';
                    break;
                case 7:
                    $scope.status.open07 = true;
                    $scope.introSlice07 = 'views/intro_07.html';
                    break;
                case 8:
                    $scope.status.open08 = true ;
                    $scope.introSlice09 = 'views/intro_08.html';
                    break;
                default :
                    $scope.status.open01 = true;
                    $scope.introSlice01 = 'views/intro_01.html';
                    break;
            }

        }

    }]);

introControllers.controller('introSliceCtrl',['$scope', '$state',
    function($scope, $state){
       $scope.$state = $state;
    }]);