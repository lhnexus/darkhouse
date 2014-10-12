/**
 * Created by VinceZK on 10/6/14.
 */
'use strict';

var blog = angular.module('blog', ['ui.router',
                                   'ngResource'])
blog.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
     function ($stateProvider, $urlRouterProvider, $locationProvider) {
         $urlRouterProvider
             .when('/detail?id', '/:id')
             .otherwise('list');

         $stateProvider
             .state('list', {
                 url: '/list',
                 templateUrl: '/views/blog_list.html',
                 resolve:{
                     blog_list:['blogs', function(blogs){
                         return blogs.list();
                     }]
                 },
                 controller:['$scope', 'blog_list',function($scope, blog_list){
                     $scope.blog_list = blog_list;
                 }]
             })
             .state('detail', {
                 url: '/:id',
                 templateUrl: '/views/blog_detail.html',
                 controller: ['$scope','$stateParams','blogs', function($scope, $stateParams, blogs){
                         var blog = blogs.getBlogById($stateParams.id);
                         $scope.blogURL = blog.name;
                     }]
             })

//         $locationProvider.html5Mode(true);
     }])

blog.controller('blogCtrl', ['$scope', '$state', '$document',function($scope,$state,$document){
    //$state.go('detail');
    $state.go('list');
    $scope.screenWidth = $document[0].body.clientWidth;
    if($scope.screenWidth > 360)
        $scope.listContainerClass = 'container'
    else
        $scope.listContainerClass = '';

    $scope.navToBlogID = function(blogId){
        $scope.isActive1 = false;
        $scope.isActive2 = false;
        $state.go('detail', {id:blogId});
    }

    $scope.latestBlog = function(){
        $scope.isActive1 = true;
        $scope.isActive2 = false;
        $state.go('detail',{id:1});
    }

    $scope.listBlogs = function(){
        $scope.isActive2 = true;
        $scope.isActive1 = false;
        $state.go('list');
    }

}])

blog.factory('blogs', ['$resource', function($resource){
    var blog_array = [];
    return{
        list: function(){
            blog_array = [
                {
                    id:1,
                    name: 'blogs/blog1.html',
                    date: '2014/10/07',
                    title: 'Compose Your First Single Page Application',
                    abstract: 'If you want to compose a web application, you must consider following stuff...',
                    author: 'VinceZK'
                },

                {
                    id:2,
                    name:'blogs/blog2.html',
                    date:'2014/10/07',
                    title:'Choose Your Weapon',
                    abstract:'Make a choice is difficult, especially there are lots of web technologies, ' +
                'like: PHP, Ruby, JAVA, JavaScript, ASP, and so on....',
                    author:'VinceZK'
                }
            ];
            return blog_array;
        },

        getBlogById: function(id){
            for (var i = 0; i < blog_array.length; i++) {
                if (blog_array[i].id == id) return blog_array[i];
            }
            return null;
        }
    }
}])