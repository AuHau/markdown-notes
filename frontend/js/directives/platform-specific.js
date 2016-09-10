//Display element only on mobile platform
angular.module('notes.ui').directive("mobileOnly", function (MOBILE_MODE, $animate) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (!MOBILE_MODE) {
                $animate.addClass(element, 'ng-hide');
            }
        }
    };
});

//Display element only on web platform
angular.module('notes.ui').directive("webOnly", function (MOBILE_MODE, $animate) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (MOBILE_MODE) {
                $animate.addClass(element, 'ng-hide');
            }
        }
    };
});

angular.module('notes.ui').directive("webOnlyDisable", function (MOBILE_MODE, $animate) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (MOBILE_MODE) {
                element.attr("disabled", "disabled");
            }
        }
    };
});