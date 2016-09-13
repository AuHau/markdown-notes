angular.module('notes.ui').directive("uploadPicture", function (MOBILE_MODE, $photosService, __env) {

    var cameraOptions = {
        quality : 50,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        targetWidth: __env.pictureMaxSize,
        targetHeight: __env.pictureMaxSize
    };

    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (!MOBILE_MODE) {
                return;
            }

            element.on('click', function () {
                navigator.camera.getPicture($photosService.handleTakenPicture, function (err) {console.log(err)}, cameraOptions);
            });
        }
    };
});