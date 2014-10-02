/**
 * Created by VinceZK on 9/14/14.
 */
var dkDirectives = angular.module('dkDirectives',[]);


// Define a directive and have it $watch a property/trigger so it knows when to focus the element:
dkDirectives.directive('focusMe', function($timeout, $parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                //console.log('value=',value);
                if(value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
            element.bind('blur', function() {
                //console.log('blur')
                scope.$apply(model.assign(scope, false));
            })
        }
    };
});
