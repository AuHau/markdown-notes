angular.module('notes.service')
    .factory('$photosService', function (Uploader, $messageService) {
        return {
            handleTakenPicture: function (photoUri) {
                var message = {
                    message: 'Uploading image...',
                    class: $messageService.classes.INFO,
                    timeout: 8000,
                };
                $messageService.add(message);

                Uploader.uploadMobileImage(photoUri)
                    .then(function () {
                        //Delete the "uploading" message
                        $messageService.remove(message);

                        // TODO: Some special event for Mobile upload image?
                        //ga('send', 'event', 'Notes', 'Upload', 'Image upload');
                    })
                    .catch(function (error) {
                        console.log(error);
                        error = {
                            message: 'An error occured while uploading the images.',
                            class: $messageService.classes.ERROR,
                            timeout: 5000,
                        };
                        $messageService.replace(message, error);
                    });

            }
        };
    });