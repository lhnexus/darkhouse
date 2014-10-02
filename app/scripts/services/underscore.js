/**
 * Created by VinceZK on 9/30/14.
 */
var underscore = angular.module('underscore', []);
underscore.factory('_', function(){
    return window._;
})