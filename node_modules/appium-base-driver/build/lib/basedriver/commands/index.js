'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _timeout = require('./timeout');

var _timeout2 = _interopRequireDefault(_timeout);

var _find = require('./find');

var _find2 = _interopRequireDefault(_find);

var commands = {};
_Object$assign(commands, _session2['default'], _settings2['default'], _timeout2['default'], _find2['default']);

// add other command types here
exports['default'] = commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9iYXNlZHJpdmVyL2NvbW1hbmRzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7dUJBQXdCLFdBQVc7Ozs7d0JBQ1YsWUFBWTs7Ozt1QkFDYixXQUFXOzs7O29CQUNkLFFBQVE7Ozs7QUFFN0IsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLGVBQ0UsUUFBUSx1RkFNVCxDQUFDOzs7cUJBRWEsUUFBUSIsImZpbGUiOiJsaWIvYmFzZWRyaXZlci9jb21tYW5kcy9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzZXNzaW9uQ21kcyBmcm9tICcuL3Nlc3Npb24nO1xuaW1wb3J0IHNldHRpbmdzQ21kcyBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB0aW1lb3V0Q21kcyBmcm9tICcuL3RpbWVvdXQnO1xuaW1wb3J0IGZpbmRDbWRzIGZyb20gJy4vZmluZCc7XG5cbmxldCBjb21tYW5kcyA9IHt9O1xuT2JqZWN0LmFzc2lnbihcbiAgY29tbWFuZHMsXG4gIHNlc3Npb25DbWRzLFxuICBzZXR0aW5nc0NtZHMsXG4gIHRpbWVvdXRDbWRzLFxuICBmaW5kQ21kcyxcbiAgLy8gYWRkIG90aGVyIGNvbW1hbmQgdHlwZXMgaGVyZVxuKTtcblxuZXhwb3J0IGRlZmF1bHQgY29tbWFuZHM7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uLy4uIn0=
