angular.module('notes.service').factory('Uploader', ['$http', 'MOBILE_MODE', '__env', '$q', '$authService', 'csrfToken', function ($http, MOBILE_MODE, __env, $q, $authService, csrfToken) {
    var UPLOAD_ROUTE = '/upload/image/';

    var Uploader = function (data) {
        angular.extend(this, data);
    };

    Uploader.uploadImage = function (file, note) {
        //Check file type
        if (!file || !file.type.match(/image.*/)) return;

        //Build the form data (file, note ID and CSRF token)
        var fd = new FormData();
        fd.append("image", file); // Append the file
        fd.append("note", note.id);

        //Send the request
        return $http({
            method: 'POST',
            url: UPLOAD_ROUTE,
            data: fd,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity,
        }).then(function (response) {
            return response.headers('Location');
        });
    };

    Uploader.uploadMobileImage = function (imageUri) {
        if (!MOBILE_MODE) {
            console.log('Uploader.uploadMobileImage is intended for mobile environment only!');
            return;
        }

        var options = {
            fileKey: 'image',
            chunkedMode: false,
            headers: {
                'Authorization': 'ApiKey ' + $authService.getApiKey(),
                Connection: "close"
            }
        };

        return $q(function (resolve, reject) {
            if (csrfToken) {
                resolve(csrfToken);
            } else {
                resolve($authService.retrieveCsrfToken());
            }
        }).then(function (csrfToken) {
            options.headers['X-XSRF-TOKEN'] = csrfToken;
            var ft = new FileTransfer();
            return $q(function (resolve, reject) {
                ft.upload(imageUri, encodeURI(__env.apiUrl + UPLOAD_ROUTE), resolve, reject, options);
            });
        });
    };

    return Uploader;
}]);