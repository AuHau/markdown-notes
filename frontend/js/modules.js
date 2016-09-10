angular.module('notes', ['notes.service', 'notes.utils', 'notes.ui', 'ngRoute', 'ui.codemirror', 'timeRelative']);
angular.module('notes.config', []);
angular.module('notes.service', ['notes.config', 'angularModalService', 'base64']);
angular.module('notes.utils', []);
angular.module('notes.ui', []);

// Frontend client global configuration
var __env = {};

if(window){
  Object.assign(__env, window.__env);
}

angular.module('notes.config').constant('__env', __env);
