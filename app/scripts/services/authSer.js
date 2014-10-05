/**
 * Created by VinceZK on 9/23/14.
 */
'use strict';

angular.module('darkhouse')
    .factory('auth', ['$http', '$resource', 'authService', '$rootScope',
        function($http, $resource, authService, $rootScope){
            /**
             *Parse user information from array to json
             * @param userInfo: user information array in "attr_name/attr_value" pairs
             * @returns {userJson|*}
             */
            function parseUserInfo(userInfo){
                if(userInfo.length == 0)return;
                $rootScope.currentUserArray = userInfo;
                var userJson = {
                    USER_ID: '',
                    USER_NAME: '',
                    EMAIL: '',
                    GENDER: '',
                    COMPANY: '',
                    TITLE: '',
                    PHOTO: '',
                    VALID_FROM: '',
                    VALID_TO: ''
                }
                userJson.USER_ID = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'USER_ID';
                }).attr_value;

                userJson.USER_NAME  = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'USER_NAME';
                }).attr_value;

                userJson.EMAIL = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'EMAIL';
                }).attr_value;

                userJson.GENDER = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'GENDER';
                }).attr_value;

                userJson.COMPANY = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'COMPANY';
                }).attr_value;

                userJson.TITLE = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'TITLE';
                }).attr_value;

                userJson.PHOTO = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'PHOTO';
                }).attr_value;

                userJson.VALID_FROM = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'VALID_FROM';
                }).attr_value;

                userJson.VALID_TO = _.find(userInfo, function (attribute) {
                    return attribute.attr_name === 'VALID_TO';
                }).attr_value;

                return userJson;
            }

            return {
                /**
                 * Login a user using $http.post way
                 * @param user
                 * @param success
                 * @param error
                 */
                login: function(user, success, error) {
                    $http.post('/api/login', user)
                        .success(function(user){
                            success(user);
                            //authService.loginConfirmed();
                        }).error(error);
                },

                /**
                 * Login a user using $resource way
                 * @param user
                 * @param success
                 * @param error
                 */
                login_resource: function(user, success, error){
                    $resource('/api/login').save(
                        user,
                        function (value) {
                            success(value);
                            //authService.loginConfirmed();
                        },
                        function (err){
                            error(err);
                        }
                    )
                },

                renewPWD: function(user, success, error){
                    $resource('/api/renewPWD').save(
                        user,
                        function (value) {
                            success();
                        },
                        function (err){
                            error(err);
                        }
                    )
                },
                /**
                 * Get current user:
                 * 1)Check whether current user's session is expired?
                 * 2)If not, return the current user information in json format.
                 */
                currentUser: function(callback){
                    $resource('/api/login').get(function(user){
                        if(!user.userInfo || user.userInfo.length == 0){
                            callback({
                                message: 'User information is NULL!'
                            });
                        }else{
                            $rootScope.currentUser = parseUserInfo(user.userInfo);
                            authService.loginConfirmed();
                        }

                    })
                },

                /**
                 * log current user session out
                 * @param callback
                 */
                logout: function(callback){
                    $resource('/api/login').delete(function(res){
                        $rootScope.currentUser = null;
                        $rootScope.navBar = false;
                        $rootScope.navBarURL = null;
                        callback();
                    },
                    function(err){
                        callback(err);
                    })
                },

                parseUserInfo: parseUserInfo,

                userEntityMeta: function(callback){
                    $resource('/api/getUserMeta').get(function(userMeta){
                           callback(null,  userMeta);
                        },
                        function(err){
                            callback(err);
                        })
                }
            }
        }])

