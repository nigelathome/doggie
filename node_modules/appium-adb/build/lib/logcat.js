'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _teen_process = require('teen_process');

var _appiumSupport = require('appium-support');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var log = _appiumSupport.logger.getLogger('Logcat');
var MAX_BUFFER_SIZE = 10000;
var LOGCAT_PROC_STARTUP_TIMEOUT = 10000;

var Logcat = (function () {
  function Logcat() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Logcat);

    this.adb = opts.adb;
    this.clearLogs = opts.clearDeviceLogsOnStart || false;
    this.debug = opts.debug;
    this.debugTrace = opts.debugTrace;
    this.maxBufferSize = opts.maxBufferSize || MAX_BUFFER_SIZE;
    this.logs = [];
    this.logIdxSinceLastRequest = 0;
  }

  _createClass(Logcat, [{
    key: 'startCapture',
    value: function startCapture() {
      var _this2 = this;

      var started = false;
      return new _bluebird2['default'](function callee$2$0(_resolve, _reject) {
        var resolve, reject;
        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
          var _this = this;

          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              resolve = function resolve() {
                started = true;
                _resolve.apply(undefined, arguments);
              };

              reject = function reject() {
                started = true;
                _reject.apply(undefined, arguments);
              };

              if (!this.clearLogs) {
                context$3$0.next = 5;
                break;
              }

              context$3$0.next = 5;
              return _regeneratorRuntime.awrap(this.clear());

            case 5:

              log.debug('Starting logcat capture');
              this.proc = new _teen_process.SubProcess(this.adb.path, this.adb.defaultArgs.concat(['logcat', '-v', 'threadtime']));
              this.proc.on('exit', function (code, signal) {
                log.error('Logcat terminated with code ' + code + ', signal ' + signal);
                _this.proc = null;
                if (!started) {
                  log.warn('Logcat not started. Continuing');
                  resolve();
                }
              });
              this.proc.on('lines-stderr', function (lines) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = _getIterator(lines), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var line = _step.value;

                    if (/execvp\(\)/.test(line)) {
                      log.error('Logcat process failed to start');
                      reject(new Error('Logcat process failed to start. stderr: ' + line));
                    }
                    _this.outputHandler(line, 'STDERR: ');
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                      _iterator['return']();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }

                resolve();
              });
              this.proc.on('lines-stdout', function (lines) {
                resolve();
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = _getIterator(lines), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var line = _step2.value;

                    _this.outputHandler(line);
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                      _iterator2['return']();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              });
              context$3$0.next = 12;
              return _regeneratorRuntime.awrap(this.proc.start(0));

            case 12:
              // resolve after a timeout, even if no output was recorded
              setTimeout(resolve, LOGCAT_PROC_STARTUP_TIMEOUT);

            case 13:
            case 'end':
              return context$3$0.stop();
          }
        }, null, _this2);
      });
    }
  }, {
    key: 'outputHandler',
    value: function outputHandler(output) {
      var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      output = output.trim();
      if (!output) {
        return;
      }

      if (this.logs.length >= this.maxBufferSize) {
        this.logs.shift();
        if (this.logIdxSinceLastRequest > 0) {
          --this.logIdxSinceLastRequest;
        }
      }
      var outputObj = {
        timestamp: Date.now(),
        level: 'ALL',
        message: output
      };
      this.logs.push(outputObj);
      var isTrace = /W\/Trace/.test(output);
      if (this.debug && (!isTrace || this.debugTrace)) {
        log.debug(prefix + output);
      }
    }
  }, {
    key: 'stopCapture',
    value: function stopCapture() {
      return _regeneratorRuntime.async(function stopCapture$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            log.debug("Stopping logcat capture");

            if (!(!this.proc || !this.proc.isRunning)) {
              context$2$0.next = 5;
              break;
            }

            log.debug("Logcat already stopped");
            this.proc = null;
            return context$2$0.abrupt('return');

          case 5:
            this.proc.removeAllListeners('exit');
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.proc.stop());

          case 8:
            this.proc = null;

          case 9:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getLogs',
    value: function getLogs() {
      if (this.logIdxSinceLastRequest < this.logs.length) {
        var result = this.logs.slice(this.logIdxSinceLastRequest);
        this.logIdxSinceLastRequest = this.logs.length;
        return result;
      }
      return [];
    }
  }, {
    key: 'getAllLogs',
    value: function getAllLogs() {
      return this.logs;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var args;
      return _regeneratorRuntime.async(function clear$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            log.debug('Clearing logcat logs from device');
            context$2$0.prev = 1;
            args = this.adb.defaultArgs.concat(['logcat', '-c']);

            log.debug('Running \'' + this.adb.path + ' ' + args.join(' ') + '\'');
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap((0, _teen_process.exec)(this.adb.path, args));

          case 6:
            context$2$0.next = 11;
            break;

          case 8:
            context$2$0.prev = 8;
            context$2$0.t0 = context$2$0['catch'](1);

            log.warn('Failed to clear logcat logs: ' + context$2$0.t0.message);

          case 11:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 8]]);
    }
  }]);

  return Logcat;
})();

exports['default'] = Logcat;
module.exports = exports['default'];
// eslint-disable-line promise/param-names
//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQyxDQUFDOztBQUMxRCxlQUFHLENBQUMsS0FBSyxnQkFBYSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFJLENBQUM7OzZDQUNwRCx3QkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7Ozs7Ozs7Ozs7QUFFL0IsZUFBRyxDQUFDLElBQUksbUNBQWlDLGVBQUksT0FBTyxDQUFHLENBQUM7Ozs7Ozs7S0FFM0Q7OztTQXJIRyxNQUFNOzs7cUJBd0hHLE1BQU0iLCJmaWxlIjoibGliL2xvZ2NhdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YlByb2Nlc3MsIGV4ZWMgfSBmcm9tICd0ZWVuX3Byb2Nlc3MnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuXG5cbmNvbnN0IGxvZyA9IGxvZ2dlci5nZXRMb2dnZXIoJ0xvZ2NhdCcpO1xuY29uc3QgTUFYX0JVRkZFUl9TSVpFID0gMTAwMDA7XG5jb25zdCBMT0dDQVRfUFJPQ19TVEFSVFVQX1RJTUVPVVQgPSAxMDAwMDtcblxuY2xhc3MgTG9nY2F0IHtcbiAgY29uc3RydWN0b3IgKG9wdHMgPSB7fSkge1xuICAgIHRoaXMuYWRiID0gb3B0cy5hZGI7XG4gICAgdGhpcy5jbGVhckxvZ3MgPSBvcHRzLmNsZWFyRGV2aWNlTG9nc09uU3RhcnQgfHwgZmFsc2U7XG4gICAgdGhpcy5kZWJ1ZyA9IG9wdHMuZGVidWc7XG4gICAgdGhpcy5kZWJ1Z1RyYWNlID0gb3B0cy5kZWJ1Z1RyYWNlO1xuICAgIHRoaXMubWF4QnVmZmVyU2l6ZSA9IG9wdHMubWF4QnVmZmVyU2l6ZSB8fCBNQVhfQlVGRkVSX1NJWkU7XG4gICAgdGhpcy5sb2dzID0gW107XG4gICAgdGhpcy5sb2dJZHhTaW5jZUxhc3RSZXF1ZXN0ID0gMDtcbiAgfVxuXG4gIHN0YXJ0Q2FwdHVyZSAoKSB7XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gbmV3IEIoYXN5bmMgKF9yZXNvbHZlLCBfcmVqZWN0KSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJvbWlzZS9wYXJhbS1uYW1lc1xuICAgICAgY29uc3QgcmVzb2x2ZSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBfcmVzb2x2ZSguLi5hcmdzKTtcbiAgICAgIH07XG4gICAgICBjb25zdCByZWplY3QgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgX3JlamVjdCguLi5hcmdzKTtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLmNsZWFyTG9ncykge1xuICAgICAgICBhd2FpdCB0aGlzLmNsZWFyKCk7XG4gICAgICB9XG5cbiAgICAgIGxvZy5kZWJ1ZygnU3RhcnRpbmcgbG9nY2F0IGNhcHR1cmUnKTtcbiAgICAgIHRoaXMucHJvYyA9IG5ldyBTdWJQcm9jZXNzKHRoaXMuYWRiLnBhdGgsIHRoaXMuYWRiLmRlZmF1bHRBcmdzLmNvbmNhdChbJ2xvZ2NhdCcsICctdicsICd0aHJlYWR0aW1lJ10pKTtcbiAgICAgIHRoaXMucHJvYy5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgbG9nLmVycm9yKGBMb2djYXQgdGVybWluYXRlZCB3aXRoIGNvZGUgJHtjb2RlfSwgc2lnbmFsICR7c2lnbmFsfWApO1xuICAgICAgICB0aGlzLnByb2MgPSBudWxsO1xuICAgICAgICBpZiAoIXN0YXJ0ZWQpIHtcbiAgICAgICAgICBsb2cud2FybignTG9nY2F0IG5vdCBzdGFydGVkLiBDb250aW51aW5nJyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvYy5vbignbGluZXMtc3RkZXJyJywgKGxpbmVzKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICBpZiAoL2V4ZWN2cFxcKFxcKS8udGVzdChsaW5lKSkge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdMb2djYXQgcHJvY2VzcyBmYWlsZWQgdG8gc3RhcnQnKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYExvZ2NhdCBwcm9jZXNzIGZhaWxlZCB0byBzdGFydC4gc3RkZXJyOiAke2xpbmV9YCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm91dHB1dEhhbmRsZXIobGluZSwgJ1NUREVSUjogJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb2Mub24oJ2xpbmVzLXN0ZG91dCcsIChsaW5lcykgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIGZvciAobGV0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICB0aGlzLm91dHB1dEhhbmRsZXIobGluZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jLnN0YXJ0KDApO1xuICAgICAgLy8gcmVzb2x2ZSBhZnRlciBhIHRpbWVvdXQsIGV2ZW4gaWYgbm8gb3V0cHV0IHdhcyByZWNvcmRlZFxuICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBMT0dDQVRfUFJPQ19TVEFSVFVQX1RJTUVPVVQpO1xuICAgIH0pO1xuICB9XG5cbiAgb3V0cHV0SGFuZGxlciAob3V0cHV0LCBwcmVmaXggPSAnJykge1xuICAgIG91dHB1dCA9IG91dHB1dC50cmltKCk7XG4gICAgaWYgKCFvdXRwdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sb2dzLmxlbmd0aCA+PSB0aGlzLm1heEJ1ZmZlclNpemUpIHtcbiAgICAgIHRoaXMubG9ncy5zaGlmdCgpO1xuICAgICAgaWYgKHRoaXMubG9nSWR4U2luY2VMYXN0UmVxdWVzdCA+IDApIHtcbiAgICAgICAgLS10aGlzLmxvZ0lkeFNpbmNlTGFzdFJlcXVlc3Q7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG91dHB1dE9iaiA9IHtcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIGxldmVsOiAnQUxMJyxcbiAgICAgIG1lc3NhZ2U6IG91dHB1dCxcbiAgICB9O1xuICAgIHRoaXMubG9ncy5wdXNoKG91dHB1dE9iaik7XG4gICAgY29uc3QgaXNUcmFjZSA9IC9XXFwvVHJhY2UvLnRlc3Qob3V0cHV0KTtcbiAgICBpZiAodGhpcy5kZWJ1ZyAmJiAoIWlzVHJhY2UgfHwgdGhpcy5kZWJ1Z1RyYWNlKSkge1xuICAgICAgbG9nLmRlYnVnKHByZWZpeCArIG91dHB1dCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RvcENhcHR1cmUgKCkge1xuICAgIGxvZy5kZWJ1ZyhcIlN0b3BwaW5nIGxvZ2NhdCBjYXB0dXJlXCIpO1xuICAgIGlmICghdGhpcy5wcm9jIHx8ICF0aGlzLnByb2MuaXNSdW5uaW5nKSB7XG4gICAgICBsb2cuZGVidWcoXCJMb2djYXQgYWxyZWFkeSBzdG9wcGVkXCIpO1xuICAgICAgdGhpcy5wcm9jID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9jLnJlbW92ZUFsbExpc3RlbmVycygnZXhpdCcpO1xuICAgIGF3YWl0IHRoaXMucHJvYy5zdG9wKCk7XG4gICAgdGhpcy5wcm9jID0gbnVsbDtcbiAgfVxuXG4gIGdldExvZ3MgKCkge1xuICAgIGlmICh0aGlzLmxvZ0lkeFNpbmNlTGFzdFJlcXVlc3QgPCB0aGlzLmxvZ3MubGVuZ3RoKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmxvZ3Muc2xpY2UodGhpcy5sb2dJZHhTaW5jZUxhc3RSZXF1ZXN0KTtcbiAgICAgIHRoaXMubG9nSWR4U2luY2VMYXN0UmVxdWVzdCA9IHRoaXMubG9ncy5sZW5ndGg7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXRBbGxMb2dzICgpIHtcbiAgICByZXR1cm4gdGhpcy5sb2dzO1xuICB9XG5cbiAgYXN5bmMgY2xlYXIgKCkge1xuICAgIGxvZy5kZWJ1ZygnQ2xlYXJpbmcgbG9nY2F0IGxvZ3MgZnJvbSBkZXZpY2UnKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXJncyA9IHRoaXMuYWRiLmRlZmF1bHRBcmdzLmNvbmNhdChbJ2xvZ2NhdCcsICctYyddKTtcbiAgICAgIGxvZy5kZWJ1ZyhgUnVubmluZyAnJHt0aGlzLmFkYi5wYXRofSAke2FyZ3Muam9pbignICcpfSdgKTtcbiAgICAgIGF3YWl0IGV4ZWModGhpcy5hZGIucGF0aCwgYXJncyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2cud2FybihgRmFpbGVkIHRvIGNsZWFyIGxvZ2NhdCBsb2dzOiAke2Vyci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2djYXQ7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uIn0=
