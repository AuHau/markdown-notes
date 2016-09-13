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
                        $messageService.replace(message, {
                            message: 'Image successfully uploaded!',
                            class: $messageService.classes.SUCCESS,
                            timeout: 14000
                        });

                        // TODO: Some special event for Mobile upload image?
                        //ga('send', 'event', 'Notes', 'Upload', 'Image upload');
                    })
                    .catch(function (error) {
                        console.log(error);
                        $messageService.replace(message, {
                            message: 'An error occurred while uploading the images.',
                            class: $messageService.classes.ERROR,
                            timeout: 5000
                        });
                    });

            }
        };
    });