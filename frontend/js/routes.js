angular.module('notes').config(function($locationProvider, $routeProvider, MOBILE_MODE) {
    $locationProvider.html5Mode(false);

    var path = (MOBILE_MODE ? '/build/views/' : '/static/js/views/');
    $routeProvider
        .when('/', {
            templateUrl: path + 'main.html',
            controller: 'NotesCtrl',
            reloadOnSearch: false,
        })
        .when('/:noteId/', {
            templateUrl: path + 'preview.html',
            controller: 'NotesPreviewCtrl',
            reloadOnSearch: false,
        })
        .otherwise({ redirectTo: '/' });
});