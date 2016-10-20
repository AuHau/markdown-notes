/**
 * Holds ApiKey and take care of managing Modal window with User management
 */
var servicesModule = angular.module('notes.service');

servicesModule.factory('$authService', function (ModalService, $timeout, $q, $http, $base64, $window, DEMO_MODE, MOBILE_MODE) {
    var USER_ROUTE = '/api/v1/user/',
        SIGNUP_ROUTE = '/api/v1/create_user/',
        PASSWORD_RECOVERY_ROUTE = '/api/v1/password_recovery/';

    var apiKey = undefined;

    function fakePromise() {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
    }

    var $authService = {
        /**
         * Function for logging in the user and retrieving ApiKey using
         * HTTP Basic Authentication.
         *
         * @param username
         * @param password
         * @param rememberMe - if defined and true, will store ApiKey into LocalStorage
         * @returns {angular.IPromise<TResult>}
         */
        login: function (username, password, rememberMe) {
            var auth = $base64.encode(username + ":" + password),
                headers = {"Authorization": "Basic " + auth};

            return $http.get(USER_ROUTE, {headers: headers})
                .then(function (response) {
                    apiKey = username + ":" + response.data.api_key;
                    $window.sessionStorage.apiKey = apiKey;

                    if(rememberMe) {
                        $window.localStorage.apiKey = apiKey;
                    }

                    angular.module('notes').value('csrfToken', response.data.csrf_token);

                    return apiKey;
                });
        },

        /**
         * Function for logout of the user. Remove the locally stored ApiKey of the user.
         */
        logout: function () {
            $window.sessionStorage.removeItem('apiKey');
            $window.localStorage.removeItem('apiKey');
            apiKey = undefined;
        },

        /**
         * Function for creating new user.
         *
         * @param username
         * @param email
         * @param password
         * @returns {*|IPromise<TResult>}
         */
        signUp: function (username, email, password) {
            var payload = {
                'username': username,
                'email': email,
                'password': password
            };

            return $http.post(SIGNUP_ROUTE, payload)
                .then(function (response) {
                    apiKey = username + ":" + response.data.api_key;
                    $window.sessionStorage.apiKey = apiKey;
                    return apiKey;
                });
        },

        /**
         * Function for recovering lost password defined by email
         *
         * @param email
         * @returns {HttpPromise}
         */
        passwordRecovery: function (email) {
            var payload = {
                'email': email
            };

            return $http.post(PASSWORD_RECOVERY_ROUTE, payload);
        },

        /**
         * Function for updating user's account settings.
         *
         * @param payload
         * @returns {HttpPromise}
         */
        updateAccountSettings: function (payload) {
            return $http.patch(USER_ROUTE, payload);
        },

        /**
         * Return ApiKey or undefined if no ApiKey is found
         *
         * @returns {*}
         */
        getApiKey: function () {
            // Check local storage for ApiKey
            if (apiKey === undefined) {
                apiKey = $window.sessionStorage.apiKey || $window.localStorage.apiKey;
            }

            return apiKey;
        },

        /**
         * True if UserService has ApiKey and therefore User is logged in
         *
         * @returns {boolean}
         */
        isLoggedIn: function () {
            return this.getApiKey() !== undefined;
        },

        /**
         * Method for retrieving CsrfToken from backend.
         * @returns {*}
         */
        retrieveCsrfToken: function () {
            if(!this.isLoggedIn()){
                return this.modal();
            }

            return $http.get(USER_ROUTE)
                .then(function (response) {
                    var csrfToken = response.data.csrf_token;
                    angular.module('notes').value('csrfToken', csrfToken);
                    return csrfToken;
                });
        },

        /**
         * Create modal window with login/signup form and return promise
         * which will result with ApiKey of the user.
         *
         * @returns {angular.IPromise<TResult>}
         */
        modal: function (formType) {
            if(DEMO_MODE) {
                return fakePromise();
            }

            var path = (MOBILE_MODE ? 'build/views/' : '/static/js/views/');
            return ModalService.showModal({
                templateUrl: path + "modal.html",
                controller: "ModalCtrl",
                inputs : {
                    'formType' : formType
                }
            }).then(function (modal) {
                return modal.close;
            });
        }
    };

    return $authService;
});

/**
 * HTTPRequestInterceptor which includes the ApiKey into all API requests
 * when the user is logged in.
 */
servicesModule.factory('httpRequestInterceptor', function ($injector, __env) {
    return {
        request: function (config) {
            if (config.url.indexOf('/api') == 0)
                config.url = __env.apiUrl + config.url;

            var $authService = $injector.get('$authService');
            if ($authService.isLoggedIn()) {
                config.headers['Authorization'] = 'ApiKey ' + $authService.getApiKey();
            }

            config.headers['X-Requested-With'] = 'XMLHttpRequest';

            return config;
        }
    };
});

servicesModule.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
});