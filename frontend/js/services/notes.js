//Syncs notes with the API
angular.module('notes.service', ['ngResource', 'notes.config'])
    .factory('$notesService', ['$rootScope', '$http', 'DUMMY_API','$q', function($rootScope, $http, DUMMY_API, $q){
        var notesUrl = DUMMY_API ? '/api/v1/note-dummy/' : '/api/v1/note/?format=json',
            sharedNoteUrl = '/api/v1/shared-note/';

        function fakePromise(){
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }

        var timeZone = jstz.determine().name();

        var $notesService = {
            notes: [],
            save: function(note) {
                note.title = note.title || "";
                note.date_updated = moment.utc().tz(timeZone).toJSON();

                if(DUMMY_API){
                    note.id = note.id || Math.ceil(Math.random()*10000);
                    return fakePromise();
                }

                var notesService = this;
                return $http.post(notesUrl, note).success(function(returnedNote) {
                    if(!note.id){
                        note.date_created = moment.utc(returnedNote.date_created).tz(timeZone).toJSON();

                        notesService.notes.push(note);
                    }
                    note.id = returnedNote.id;
                });
            },
            remove: function(note) {
                var index = this.notes.indexOf(note);

                if(index >= 0){
                    if(DUMMY_API) return fakePromise();

                    var notesService = this;
                    return $http.delete(notesUrl + note.id + '/').success(function(){
                        notesService.notes.splice(index, 1);
                    });
                }
            },
            fetchFromServer: function(publicNoteId){
                var notesService = this,
                    apiUrl = publicNoteId ? sharedNoteUrl + publicNoteId : notesUrl;
                return $http.get(apiUrl).then(function(response) {
                    if(publicNoteId){
                        notesService.notes = [response.data];
                    }
                    else{
                        notesService.notes = response.data.objects;
                        notesService.notes.forEach(function(note){
                            note.date_created = moment.utc(note.date_created).tz(timeZone).toJSON();
                            note.date_updated = moment.utc(note.date_updated).tz(timeZone).toJSON();
                        });
                    }
                });
            }
        };

        return $notesService;
    }]);