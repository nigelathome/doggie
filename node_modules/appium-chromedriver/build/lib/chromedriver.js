require('source-map-support').install();

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _appiumBaseDriver = require('appium-base-driver');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _appiumSupport = require('appium-support');

var _asyncbox = require('asyncbox');

var _teen_process = require('teen_process');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _install = require('./install');

var log = _appiumSupport.logger.getLogger('Chromedriver');

var DEFAULT_HOST = '127.0.0.1';
var DEFAULT_PORT = 9515;

var Chromedriver = (function (_events$EventEmitter) {
  _inherits(Chromedriver, _events$EventEmitter);

  function Chromedriver() {
    var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Chromedriver);

    var host = args.host;
    var port = args.port;
    var executable = args.executable;
    var cmdArgs = args.cmdArgs;
    var adb = args.adb;
    var verbose = args.verbose;
    var logPath = args.logPath;

    _get(Object.getPrototypeOf(Chromedriver.prototype), 'constructor', this).call(this);
    this.proxyHost = host || DEFAULT_HOST;
    this.proxyPort = port || DEFAULT_PORT;
    this.adb = adb;
    this.cmdArgs = cmdArgs;
    this.proc = null;
    this.chromedriver = executable;
    this.executableVerified = false;
    this.state = Chromedriver.STATE_STOPPED;
    this.jwproxy = new _appiumBaseDriver.JWProxy({ server: this.proxyHost, port: this.proxyPort });
    this.verbose = verbose;
    this.logPath = logPath;
  }

  _createClass(Chromedriver, [{
    key: 'initChromedriverPath',
    value: function initChromedriverPath() {
      var binPath;
      return _regeneratorRuntime.async(function initChromedriverPath$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.executableVerified) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return');

          case 2:
            context$2$0.t0 = this.chromedriver;

            if (context$2$0.t0) {
              context$2$0.next = 7;
              break;
            }

            context$2$0.next = 6;
            return _regeneratorRuntime.awrap((0, _install.getChromedriverBinaryPath)());

          case 6:
            context$2$0.t0 = context$2$0.sent;

          case 7:
            binPath = context$2$0.t0;
            context$2$0.next = 10;
            return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(binPath));

          case 10:
            if (context$2$0.sent) {
              context$2$0.next = 12;
              break;
            }

            throw new Error('Trying to use a chromedriver binary at the path ' + (binPath + ', but it doesn\'t exist!'));

          case 12:
            this.chromedriver = binPath;
            this.executableVerified = true;
            log.info('Set chromedriver binary as: ' + this.chromedriver);

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'start',
    value: function start(caps) {
      var emitStartingState = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
      var args, startDetector, processIsAlive, webviewVersion;
      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.capabilities = caps;
            if (emitStartingState) {
              this.changeState(Chromedriver.STATE_STARTING);
            }

            args = ["--url-base=wd/hub", '--port=' + this.proxyPort];

            if (this.adb && this.adb.adbPort) {
              args = args.concat(['--adb-port=' + this.adb.adbPort]);
            }
            if (this.cmdArgs) {
              args = args.concat(this.cmdArgs);
            }
            if (this.logPath) {
              args = args.concat(['--log-path=' + this.logPath]);
            }
            args = args.concat(['--verbose']);
            // what are the process stdout/stderr conditions wherein we know that
            // the process has started to our satisfaction?

            startDetector = function startDetector(stdout) {
              return stdout.indexOf('Starting ') === 0;
            };

            processIsAlive = false;
            webviewVersion = undefined;
            context$2$0.prev = 10;
            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(this.initChromedriverPath());

          case 13:
            context$2$0.next = 15;
            return _regeneratorRuntime.awrap(this.killAll());

          case 15:

            // set up our subprocess object
            this.proc = new _teen_process.SubProcess(this.chromedriver, args);
            processIsAlive = true;

            // handle log output
            this.proc.on('output', function (stdout, stderr) {
              // if the cd output is not printed, find the chrome version and print
              // will get a response like
              //   DevTools response: {
              //      "Android-Package": "io.appium.sampleapp",
              //      "Browser": "Chrome/55.0.2883.91",
              //      "Protocol-Version": "1.2",
              //      "User-Agent": "...",
              //      "WebKit-Version": "537.36"
              //   }
              var out = stdout + stderr;
              var match = /"Browser": "(.*)"/.exec(out);
              if (match) {
                webviewVersion = match[1];
                log.debug('Webview version: \'' + webviewVersion + '\'');
              }

              // also print chromedriver version to logs
              // will output something like
              //  Starting ChromeDriver 2.33.506106 (8a06c39c4582fbfbab6966dbb1c38a9173bfb1a2) on port 9515
              match = /Starting ChromeDriver ([\.\d]+)/.exec(out);
              if (match) {
                log.debug('Chromedriver version: \'' + match[1] + '\'');
              }

              // give the output if it is requested
              if (_this.verbose) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = _getIterator((stdout || '').trim().split('\n')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var line = _step.value;

                    if (!line.trim().length) continue; // eslint-disable-line curly
                    log.debug('[STDOUT] ' + line);
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

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = _getIterator((stderr || '').trim().split('\n')), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var line = _step2.value;

                    if (!line.trim().length) continue; // eslint-disable-line curly
                    log.error('[STDERR] ' + line);
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
              }
            });

            // handle out-of-bound exit by simply emitting a stopped state
            this.proc.on('exit', function (code, signal) {
              processIsAlive = false;
              if (_this.state !== Chromedriver.STATE_STOPPED && _this.state !== Chromedriver.STATE_STOPPING && _this.state !== Chromedriver.STATE_RESTARTING) {
                var msg = 'Chromedriver exited unexpectedly with code ' + code + ', ' + ('signal ' + signal);
                log.error(msg);
                _this.changeState(Chromedriver.STATE_STOPPED);
              }
            });
            log.info('Spawning chromedriver with: ' + this.chromedriver + ' ' + ('' + args.join(' ')));
            // start subproc and wait for startDetector
            context$2$0.next = 22;
            return _regeneratorRuntime.awrap(this.proc.start(startDetector));

          case 22:
            context$2$0.next = 24;
            return _regeneratorRuntime.awrap(this.waitForOnline());

          case 24:
            context$2$0.next = 26;
            return _regeneratorRuntime.awrap(this.startSession());

          case 26:
            context$2$0.next = 36;
            break;

          case 28:
            context$2$0.prev = 28;
            context$2$0.t0 = context$2$0['catch'](10);

            this.emit(Chromedriver.EVENT_ERROR, context$2$0.t0);
            // just because we had an error doesn't mean the chromedriver process
            // finished; we should clean up if necessary

            if (!processIsAlive) {
              context$2$0.next = 34;
              break;
            }

            context$2$0.next = 34;
            return _regeneratorRuntime.awrap(this.proc.stop());

          case 34:

            // often the user's Chrome version is too low for the version of Chromedriver
            if (context$2$0.t0.message.indexOf('Chrome version must be') !== -1) {
              log.error('Unable to automate Chrome version because it is too old for this version of Chromedriver.');
              if (webviewVersion) {
                log.error('Chrome version on device: ' + webviewVersion);
              }
              log.error('Please see \'https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/web/chromedriver.md\'');
            }
            log.errorAndThrow(context$2$0.t0);

          case 36:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[10, 28]]);
    }
  }, {
    key: 'sessionId',
    value: function sessionId() {
      if (this.state !== Chromedriver.STATE_ONLINE) {
        return null;
      }

      return this.jwproxy.sessionId;
    }
  }, {
    key: 'restart',
    value: function restart() {
      return _regeneratorRuntime.async(function restart$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            log.info("Restarting chromedriver");

            if (!(this.state !== Chromedriver.STATE_ONLINE)) {
              context$2$0.next = 3;
              break;
            }

            throw new Error("Can't restart when we're not online");

          case 3:
            this.changeState(Chromedriver.STATE_RESTARTING);
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.stop(false));

          case 6:
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.start(this.capabilities, false));

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: '_statePromise',
    value: function _statePromise() {
      var _this2 = this;

      var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      return new _bluebird2['default'](function (resolve) {
        var listener = function listener(msg) {
          if (state === null || msg.state === state) {
            resolve(msg.state);
            _this2.removeListener(Chromedriver.EVENT_CHANGED, listener);
          }
        };
        _this2.on(Chromedriver.EVENT_CHANGED, listener);
      });
    }
  }, {
    key: 'waitForOnline',
    value: function waitForOnline() {
      var chromedriverStopped;
      return _regeneratorRuntime.async(function waitForOnline$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            chromedriverStopped = false;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(20, 200, function callee$2$0() {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    if (!(this.state === Chromedriver.STATE_STOPPED)) {
                      context$3$0.next = 3;
                      break;
                    }

                    // we are either stopped or stopping, so something went wrong
                    chromedriverStopped = true;
                    return context$3$0.abrupt('return');

                  case 3:
                    context$3$0.next = 5;
                    return _regeneratorRuntime.awrap(this.getStatus());

                  case 5:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this3);
            }));

          case 3:
            if (!chromedriverStopped) {
              context$2$0.next = 5;
              break;
            }

            throw new Error('ChromeDriver crashed during startup.');

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return _regeneratorRuntime.async(function getStatus$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.jwproxy.command('/status', 'GET'));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'startSession',
    value: function startSession() {
      return _regeneratorRuntime.async(function startSession$(context$2$0) {
        var _this4 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(4, 200, function callee$2$0() {
              var res;
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.prev = 0;
                    context$3$0.next = 3;
                    return _regeneratorRuntime.awrap(this.jwproxy.command('/session', 'POST', { desiredCapabilities: this.capabilities }));

                  case 3:
                    res = context$3$0.sent;

                    if (!res.status) {
                      context$3$0.next = 6;
                      break;
                    }

                    throw new Error(res.value.message);

                  case 6:
                    context$3$0.next = 11;
                    break;

                  case 8:
                    context$3$0.prev = 8;
                    context$3$0.t0 = context$3$0['catch'](0);

                    log.errorAndThrow('Failed to start Chromedriver session: ' + context$3$0.t0.message);

                  case 11:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this4, [[0, 8]]);
            }));

          case 2:
            this.changeState(Chromedriver.STATE_ONLINE);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var emitStates = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
      return _regeneratorRuntime.async(function stop$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (emitStates) {
              this.changeState(Chromedriver.STATE_STOPPING);
            }
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.jwproxy.command('', 'DELETE'));

          case 4:
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.proc.stop('SIGTERM', 20000));

          case 6:
            if (emitStates) {
              this.changeState(Chromedriver.STATE_STOPPED);
            }
            context$2$0.next = 12;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](1);

            log.error(context$2$0.t0);

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 9]]);
    }
  }, {
    key: 'changeState',
    value: function changeState(state) {
      this.state = state;
      log.debug('Changed state to \'' + state + '\'');
      this.emit(Chromedriver.EVENT_CHANGED, { state: state });
    }
  }, {
    key: 'sendCommand',
    value: function sendCommand(url, method, body) {
      return _regeneratorRuntime.async(function sendCommand$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.jwproxy.command(url, method, body));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'proxyReq',
    value: function proxyReq(req, res) {
      return _regeneratorRuntime.async(function proxyReq$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.jwproxy.proxyReqRes(req, res));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'killAll',
    value: function killAll() {
      var cmd, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, conn, params;

      return _regeneratorRuntime.async(function killAll$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            cmd = undefined;

            if (_appiumSupport.system.isWindows()) {
              // js hint cannot handle backticks, even escaped, within template literals
              cmd = "FOR /F \"usebackq tokens=5\" %a in (`netstat -nao ^| " + "findstr /R /C:\"" + this.proxyPort + " \"`) do (" + "FOR /F \"usebackq\" %b in (`TASKLIST /FI \"PID eq %a\" ^| " + "findstr /I chromedriver.exe`) do (IF NOT %b==\"\" TASKKILL " + "/F /PID %a))";
            } else {
              cmd = 'pkill -15 -f "' + this.chromedriver + '.*--port=' + this.proxyPort + '"';
            }
            log.debug('Killing any old chromedrivers, running: ' + cmd);
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(_bluebird2['default'].promisify(_child_process2['default'].exec)(cmd));

          case 6:
            log.debug("Successfully cleaned up old chromedrivers");
            context$2$0.next = 12;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](3);

            log.warn("No old chromedrivers seemed to exist");

          case 12:
            if (!this.adb) {
              context$2$0.next = 52;
              break;
            }

            log.debug('Cleaning any old adb forwarded port socket connections');
            context$2$0.prev = 14;
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            context$2$0.prev = 18;
            context$2$0.next = 21;
            return _regeneratorRuntime.awrap(this.adb.getForwardList());

          case 21:
            context$2$0.t1 = _Symbol$iterator;
            _iterator3 = context$2$0.sent[context$2$0.t1]();

          case 23:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              context$2$0.next = 33;
              break;
            }

            conn = _step3.value;

            if (!(conn.indexOf('webview_devtools') !== -1)) {
              context$2$0.next = 30;
              break;
            }

            params = conn.split(/\s+/);

            if (!(params.length > 1)) {
              context$2$0.next = 30;
              break;
            }

            context$2$0.next = 30;
            return _regeneratorRuntime.awrap(this.adb.removePortForward(params[1].replace(/[\D]*/, '')));

          case 30:
            _iteratorNormalCompletion3 = true;
            context$2$0.next = 23;
            break;

          case 33:
            context$2$0.next = 39;
            break;

          case 35:
            context$2$0.prev = 35;
            context$2$0.t2 = context$2$0['catch'](18);
            _didIteratorError3 = true;
            _iteratorError3 = context$2$0.t2;

          case 39:
            context$2$0.prev = 39;
            context$2$0.prev = 40;

            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
              _iterator3['return']();
            }

          case 42:
            context$2$0.prev = 42;

            if (!_didIteratorError3) {
              context$2$0.next = 45;
              break;
            }

            throw _iteratorError3;

          case 45:
            return context$2$0.finish(42);

          case 46:
            return context$2$0.finish(39);

          case 47:
            context$2$0.next = 52;
            break;

          case 49:
            context$2$0.prev = 49;
            context$2$0.t3 = context$2$0['catch'](14);

            log.warn('Unable to clean forwarded ports. Error: \'' + context$2$0.t3.message + '\'. Continuing.');

          case 52:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 9], [14, 49], [18, 35, 39, 47], [40,, 42, 46]]);
    }
  }, {
    key: 'hasWorkingWebview',
    value: function hasWorkingWebview() {
      return _regeneratorRuntime.async(function hasWorkingWebview$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.jwproxy.command('/url', 'GET'));

          case 3:
            return context$2$0.abrupt('return', true);

          case 6:
            context$2$0.prev = 6;
            context$2$0.t0 = context$2$0['catch'](0);
            return context$2$0.abrupt('return', false);

          case 9:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[0, 6]]);
    }
  }]);

  return Chromedriver;
})(_events2['default'].EventEmitter);

Chromedriver.EVENT_ERROR = 'chromedriver_error';
Chromedriver.EVENT_CHANGED = 'stateChanged';
Chromedriver.STATE_STOPPED = 'stopped';
Chromedriver.STATE_STARTING = 'starting';
Chromedriver.STATE_ONLINE = 'online';
Chromedriver.STATE_STOPPING = 'stopping';
Chromedriver.STATE_RESTARTING = 'restarting';

exports['default'] = Chromedriver;
module.exports = exports['default'];
//eslint-disable-line curly

// we need to make sure that CD hasn't crashed

// retry session start 4 times, sometimes this fails due to adb

// ChromeDriver can return a positive status despite failing

// chromedriver will ask ADB to forward a port like "deviceId tcp:port localabstract:webview_devtools_remote_port"

// sometimes chromedriver stops automating webviews. this method runs a
// simple command to determine our state, and responds accordingly
//# sourceMappingURL=data:application/json;charset=utf8;base64,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bGUiOiJsaWIvY2hyb21lZHJpdmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHJhbnNwaWxlOm1haW5cblxuaW1wb3J0IGV2ZW50cyBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgSldQcm94eSB9IGZyb20gJ2FwcGl1bS1iYXNlLWRyaXZlcic7XG5pbXBvcnQgY3AgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBzeXN0ZW0sIGZzLCBsb2dnZXIgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5pbXBvcnQgeyByZXRyeUludGVydmFsIH0gZnJvbSAnYXN5bmNib3gnO1xuaW1wb3J0IHsgU3ViUHJvY2VzcyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5pbXBvcnQgQiBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyBnZXRDaHJvbWVkcml2ZXJCaW5hcnlQYXRoIH0gZnJvbSAnLi9pbnN0YWxsJztcblxuXG5jb25zdCBsb2cgPSBsb2dnZXIuZ2V0TG9nZ2VyKCdDaHJvbWVkcml2ZXInKTtcblxuY29uc3QgREVGQVVMVF9IT1NUID0gJzEyNy4wLjAuMSc7XG5jb25zdCBERUZBVUxUX1BPUlQgPSA5NTE1O1xuXG5jbGFzcyBDaHJvbWVkcml2ZXIgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKGFyZ3MgPSB7fSkge1xuICAgIGNvbnN0IHtob3N0LCBwb3J0LCBleGVjdXRhYmxlLCBjbWRBcmdzLCBhZGIsIHZlcmJvc2UsIGxvZ1BhdGh9ID0gYXJncztcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJveHlIb3N0ID0gaG9zdCB8fCBERUZBVUxUX0hPU1Q7XG4gICAgdGhpcy5wcm94eVBvcnQgPSBwb3J0IHx8IERFRkFVTFRfUE9SVDtcbiAgICB0aGlzLmFkYiA9IGFkYjtcbiAgICB0aGlzLmNtZEFyZ3MgPSBjbWRBcmdzO1xuICAgIHRoaXMucHJvYyA9IG51bGw7XG4gICAgdGhpcy5jaHJvbWVkcml2ZXIgPSBleGVjdXRhYmxlO1xuICAgIHRoaXMuZXhlY3V0YWJsZVZlcmlmaWVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZSA9IENocm9tZWRyaXZlci5TVEFURV9TVE9QUEVEO1xuICAgIHRoaXMuandwcm94eSA9IG5ldyBKV1Byb3h5KHtzZXJ2ZXI6IHRoaXMucHJveHlIb3N0LCBwb3J0OiB0aGlzLnByb3h5UG9ydH0pO1xuICAgIHRoaXMudmVyYm9zZSA9IHZlcmJvc2U7XG4gICAgdGhpcy5sb2dQYXRoID0gbG9nUGF0aDtcbiAgfVxuXG4gIGFzeW5jIGluaXRDaHJvbWVkcml2ZXJQYXRoICgpIHtcbiAgICBpZiAodGhpcy5leGVjdXRhYmxlVmVyaWZpZWQpIHJldHVybjsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIGN1cmx5XG4gICAgbGV0IGJpblBhdGggPSB0aGlzLmNocm9tZWRyaXZlciB8fCAoYXdhaXQgZ2V0Q2hyb21lZHJpdmVyQmluYXJ5UGF0aCgpKTtcbiAgICBpZiAoIWF3YWl0IGZzLmV4aXN0cyhiaW5QYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUcnlpbmcgdG8gdXNlIGEgY2hyb21lZHJpdmVyIGJpbmFyeSBhdCB0aGUgcGF0aCBgICtcbiAgICAgICAgICAgICAgICAgICAgICBgJHtiaW5QYXRofSwgYnV0IGl0IGRvZXNuJ3QgZXhpc3QhYCk7XG4gICAgfVxuICAgIHRoaXMuY2hyb21lZHJpdmVyID0gYmluUGF0aDtcbiAgICB0aGlzLmV4ZWN1dGFibGVWZXJpZmllZCA9IHRydWU7XG4gICAgbG9nLmluZm8oYFNldCBjaHJvbWVkcml2ZXIgYmluYXJ5IGFzOiAke3RoaXMuY2hyb21lZHJpdmVyfWApO1xuICB9XG5cbiAgYXN5bmMgc3RhcnQgKGNhcHMsIGVtaXRTdGFydGluZ1N0YXRlID0gdHJ1ZSkge1xuICAgIHRoaXMuY2FwYWJpbGl0aWVzID0gY2FwcztcbiAgICBpZiAoZW1pdFN0YXJ0aW5nU3RhdGUpIHtcbiAgICAgIHRoaXMuY2hhbmdlU3RhdGUoQ2hyb21lZHJpdmVyLlNUQVRFX1NUQVJUSU5HKTtcbiAgICB9XG5cbiAgICBsZXQgYXJncyA9IFtcIi0tdXJsLWJhc2U9d2QvaHViXCIsIGAtLXBvcnQ9JHt0aGlzLnByb3h5UG9ydH1gXTtcbiAgICBpZiAodGhpcy5hZGIgJiYgdGhpcy5hZGIuYWRiUG9ydCkge1xuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtgLS1hZGItcG9ydD0ke3RoaXMuYWRiLmFkYlBvcnR9YF0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5jbWRBcmdzKSB7XG4gICAgICBhcmdzID0gYXJncy5jb25jYXQodGhpcy5jbWRBcmdzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubG9nUGF0aCkge1xuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtgLS1sb2ctcGF0aD0ke3RoaXMubG9nUGF0aH1gXSk7XG4gICAgfVxuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbJy0tdmVyYm9zZSddKTtcbiAgICAvLyB3aGF0IGFyZSB0aGUgcHJvY2VzcyBzdGRvdXQvc3RkZXJyIGNvbmRpdGlvbnMgd2hlcmVpbiB3ZSBrbm93IHRoYXRcbiAgICAvLyB0aGUgcHJvY2VzcyBoYXMgc3RhcnRlZCB0byBvdXIgc2F0aXNmYWN0aW9uP1xuICAgIGNvbnN0IHN0YXJ0RGV0ZWN0b3IgPSAoc3Rkb3V0KSA9PiB7XG4gICAgICByZXR1cm4gc3Rkb3V0LmluZGV4T2YoJ1N0YXJ0aW5nICcpID09PSAwO1xuICAgIH07XG5cbiAgICBsZXQgcHJvY2Vzc0lzQWxpdmUgPSBmYWxzZTtcbiAgICBsZXQgd2Vidmlld1ZlcnNpb247XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuaW5pdENocm9tZWRyaXZlclBhdGgoKTtcbiAgICAgIGF3YWl0IHRoaXMua2lsbEFsbCgpO1xuXG4gICAgICAvLyBzZXQgdXAgb3VyIHN1YnByb2Nlc3Mgb2JqZWN0XG4gICAgICB0aGlzLnByb2MgPSBuZXcgU3ViUHJvY2Vzcyh0aGlzLmNocm9tZWRyaXZlciwgYXJncyk7XG4gICAgICBwcm9jZXNzSXNBbGl2ZSA9IHRydWU7XG5cbiAgICAgIC8vIGhhbmRsZSBsb2cgb3V0cHV0XG4gICAgICB0aGlzLnByb2Mub24oJ291dHB1dCcsIChzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICAvLyBpZiB0aGUgY2Qgb3V0cHV0IGlzIG5vdCBwcmludGVkLCBmaW5kIHRoZSBjaHJvbWUgdmVyc2lvbiBhbmQgcHJpbnRcbiAgICAgICAgLy8gd2lsbCBnZXQgYSByZXNwb25zZSBsaWtlXG4gICAgICAgIC8vICAgRGV2VG9vbHMgcmVzcG9uc2U6IHtcbiAgICAgICAgLy8gICAgICBcIkFuZHJvaWQtUGFja2FnZVwiOiBcImlvLmFwcGl1bS5zYW1wbGVhcHBcIixcbiAgICAgICAgLy8gICAgICBcIkJyb3dzZXJcIjogXCJDaHJvbWUvNTUuMC4yODgzLjkxXCIsXG4gICAgICAgIC8vICAgICAgXCJQcm90b2NvbC1WZXJzaW9uXCI6IFwiMS4yXCIsXG4gICAgICAgIC8vICAgICAgXCJVc2VyLUFnZW50XCI6IFwiLi4uXCIsXG4gICAgICAgIC8vICAgICAgXCJXZWJLaXQtVmVyc2lvblwiOiBcIjUzNy4zNlwiXG4gICAgICAgIC8vICAgfVxuICAgICAgICBjb25zdCBvdXQgPSBzdGRvdXQgKyBzdGRlcnI7XG4gICAgICAgIGxldCBtYXRjaCA9IC9cIkJyb3dzZXJcIjogXCIoLiopXCIvLmV4ZWMob3V0KTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgd2Vidmlld1ZlcnNpb24gPSBtYXRjaFsxXTtcbiAgICAgICAgICBsb2cuZGVidWcoYFdlYnZpZXcgdmVyc2lvbjogJyR7d2Vidmlld1ZlcnNpb259J2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWxzbyBwcmludCBjaHJvbWVkcml2ZXIgdmVyc2lvbiB0byBsb2dzXG4gICAgICAgIC8vIHdpbGwgb3V0cHV0IHNvbWV0aGluZyBsaWtlXG4gICAgICAgIC8vICBTdGFydGluZyBDaHJvbWVEcml2ZXIgMi4zMy41MDYxMDYgKDhhMDZjMzljNDU4MmZiZmJhYjY5NjZkYmIxYzM4YTkxNzNiZmIxYTIpIG9uIHBvcnQgOTUxNVxuICAgICAgICBtYXRjaCA9IC9TdGFydGluZyBDaHJvbWVEcml2ZXIgKFtcXC5cXGRdKykvLmV4ZWMob3V0KTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgbG9nLmRlYnVnKGBDaHJvbWVkcml2ZXIgdmVyc2lvbjogJyR7bWF0Y2hbMV19J2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2l2ZSB0aGUgb3V0cHV0IGlmIGl0IGlzIHJlcXVlc3RlZFxuICAgICAgICBpZiAodGhpcy52ZXJib3NlKSB7XG4gICAgICAgICAgZm9yIChsZXQgbGluZSBvZiAoc3Rkb3V0IHx8ICcnKS50cmltKCkuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgICAgICBpZiAoIWxpbmUudHJpbSgpLmxlbmd0aCkgY29udGludWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY3VybHlcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhgW1NURE9VVF0gJHtsaW5lfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGxldCBsaW5lIG9mIChzdGRlcnIgfHwgJycpLnRyaW0oKS5zcGxpdCgnXFxuJykpIHtcbiAgICAgICAgICAgIGlmICghbGluZS50cmltKCkubGVuZ3RoKSBjb250aW51ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjdXJseVxuICAgICAgICAgICAgbG9nLmVycm9yKGBbU1RERVJSXSAke2xpbmV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIG91dC1vZi1ib3VuZCBleGl0IGJ5IHNpbXBseSBlbWl0dGluZyBhIHN0b3BwZWQgc3RhdGVcbiAgICAgIHRoaXMucHJvYy5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgcHJvY2Vzc0lzQWxpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IENocm9tZWRyaXZlci5TVEFURV9TVE9QUEVEICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlICE9PSBDaHJvbWVkcml2ZXIuU1RBVEVfU1RPUFBJTkcgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgIT09IENocm9tZWRyaXZlci5TVEFURV9SRVNUQVJUSU5HKSB7XG4gICAgICAgICAgbGV0IG1zZyA9IGBDaHJvbWVkcml2ZXIgZXhpdGVkIHVuZXhwZWN0ZWRseSB3aXRoIGNvZGUgJHtjb2RlfSwgYCArXG4gICAgICAgICAgICAgICAgICAgIGBzaWduYWwgJHtzaWduYWx9YDtcbiAgICAgICAgICBsb2cuZXJyb3IobXNnKTtcbiAgICAgICAgICB0aGlzLmNoYW5nZVN0YXRlKENocm9tZWRyaXZlci5TVEFURV9TVE9QUEVEKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2cuaW5mbyhgU3Bhd25pbmcgY2hyb21lZHJpdmVyIHdpdGg6ICR7dGhpcy5jaHJvbWVkcml2ZXJ9IGAgK1xuICAgICAgICAgICAgICAgYCR7YXJncy5qb2luKCcgJyl9YCk7XG4gICAgICAvLyBzdGFydCBzdWJwcm9jIGFuZCB3YWl0IGZvciBzdGFydERldGVjdG9yXG4gICAgICBhd2FpdCB0aGlzLnByb2Muc3RhcnQoc3RhcnREZXRlY3Rvcik7XG4gICAgICBhd2FpdCB0aGlzLndhaXRGb3JPbmxpbmUoKTtcbiAgICAgIGF3YWl0IHRoaXMuc3RhcnRTZXNzaW9uKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5lbWl0KENocm9tZWRyaXZlci5FVkVOVF9FUlJPUiwgZSk7XG4gICAgICAvLyBqdXN0IGJlY2F1c2Ugd2UgaGFkIGFuIGVycm9yIGRvZXNuJ3QgbWVhbiB0aGUgY2hyb21lZHJpdmVyIHByb2Nlc3NcbiAgICAgIC8vIGZpbmlzaGVkOyB3ZSBzaG91bGQgY2xlYW4gdXAgaWYgbmVjZXNzYXJ5XG4gICAgICBpZiAocHJvY2Vzc0lzQWxpdmUpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wcm9jLnN0b3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gb2Z0ZW4gdGhlIHVzZXIncyBDaHJvbWUgdmVyc2lvbiBpcyB0b28gbG93IGZvciB0aGUgdmVyc2lvbiBvZiBDaHJvbWVkcml2ZXJcbiAgICAgIGlmIChlLm1lc3NhZ2UuaW5kZXhPZignQ2hyb21lIHZlcnNpb24gbXVzdCBiZScpICE9PSAtMSkge1xuICAgICAgICBsb2cuZXJyb3IoJ1VuYWJsZSB0byBhdXRvbWF0ZSBDaHJvbWUgdmVyc2lvbiBiZWNhdXNlIGl0IGlzIHRvbyBvbGQgZm9yIHRoaXMgdmVyc2lvbiBvZiBDaHJvbWVkcml2ZXIuJyk7XG4gICAgICAgIGlmICh3ZWJ2aWV3VmVyc2lvbikge1xuICAgICAgICAgIGxvZy5lcnJvcihgQ2hyb21lIHZlcnNpb24gb24gZGV2aWNlOiAke3dlYnZpZXdWZXJzaW9ufWApO1xuICAgICAgICB9XG4gICAgICAgIGxvZy5lcnJvcihgUGxlYXNlIHNlZSAnaHR0cHM6Ly9naXRodWIuY29tL2FwcGl1bS9hcHBpdW0vYmxvYi9tYXN0ZXIvZG9jcy9lbi93cml0aW5nLXJ1bm5pbmctYXBwaXVtL3dlYi9jaHJvbWVkcml2ZXIubWQnYCk7XG4gICAgICB9XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhlKTtcbiAgICB9XG4gIH1cblxuICBzZXNzaW9uSWQgKCkge1xuICAgIGlmICh0aGlzLnN0YXRlICE9PSBDaHJvbWVkcml2ZXIuU1RBVEVfT05MSU5FKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5qd3Byb3h5LnNlc3Npb25JZDtcbiAgfVxuXG4gIGFzeW5jIHJlc3RhcnQgKCkge1xuICAgIGxvZy5pbmZvKFwiUmVzdGFydGluZyBjaHJvbWVkcml2ZXJcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUgIT09IENocm9tZWRyaXZlci5TVEFURV9PTkxJTkUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlc3RhcnQgd2hlbiB3ZSdyZSBub3Qgb25saW5lXCIpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZVN0YXRlKENocm9tZWRyaXZlci5TVEFURV9SRVNUQVJUSU5HKTtcbiAgICBhd2FpdCB0aGlzLnN0b3AoZmFsc2UpO1xuICAgIGF3YWl0IHRoaXMuc3RhcnQodGhpcy5jYXBhYmlsaXRpZXMsIGZhbHNlKTtcbiAgfVxuXG4gIF9zdGF0ZVByb21pc2UgKHN0YXRlID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgQigocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSAobXNnKSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbnVsbCB8fCBtc2cuc3RhdGUgPT09IHN0YXRlKSB7XG4gICAgICAgICAgcmVzb2x2ZShtc2cuc3RhdGUpO1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoQ2hyb21lZHJpdmVyLkVWRU5UX0NIQU5HRUQsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMub24oQ2hyb21lZHJpdmVyLkVWRU5UX0NIQU5HRUQsIGxpc3RlbmVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHdhaXRGb3JPbmxpbmUgKCkge1xuICAgIC8vIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgQ0QgaGFzbid0IGNyYXNoZWRcbiAgICBsZXQgY2hyb21lZHJpdmVyU3RvcHBlZCA9IGZhbHNlO1xuICAgIGF3YWl0IHJldHJ5SW50ZXJ2YWwoMjAsIDIwMCwgYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IENocm9tZWRyaXZlci5TVEFURV9TVE9QUEVEKSB7XG4gICAgICAgIC8vIHdlIGFyZSBlaXRoZXIgc3RvcHBlZCBvciBzdG9wcGluZywgc28gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgICAgY2hyb21lZHJpdmVyU3RvcHBlZCA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuZ2V0U3RhdHVzKCk7XG4gICAgfSk7XG4gICAgaWYgKGNocm9tZWRyaXZlclN0b3BwZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2hyb21lRHJpdmVyIGNyYXNoZWQgZHVyaW5nIHN0YXJ0dXAuJyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0U3RhdHVzICgpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5qd3Byb3h5LmNvbW1hbmQoJy9zdGF0dXMnLCAnR0VUJyk7XG4gIH1cblxuICBhc3luYyBzdGFydFNlc3Npb24gKCkge1xuICAgIC8vIHJldHJ5IHNlc3Npb24gc3RhcnQgNCB0aW1lcywgc29tZXRpbWVzIHRoaXMgZmFpbHMgZHVlIHRvIGFkYlxuICAgIGF3YWl0IHJldHJ5SW50ZXJ2YWwoNCwgMjAwLCBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgcmVzID0gYXdhaXQgdGhpcy5qd3Byb3h5LmNvbW1hbmQoJy9zZXNzaW9uJywgJ1BPU1QnLCB7ZGVzaXJlZENhcGFiaWxpdGllczogdGhpcy5jYXBhYmlsaXRpZXN9KTtcbiAgICAgICAgLy8gQ2hyb21lRHJpdmVyIGNhbiByZXR1cm4gYSBwb3NpdGl2ZSBzdGF0dXMgZGVzcGl0ZSBmYWlsaW5nXG4gICAgICAgIGlmIChyZXMuc3RhdHVzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcy52YWx1ZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZy5lcnJvckFuZFRocm93KGBGYWlsZWQgdG8gc3RhcnQgQ2hyb21lZHJpdmVyIHNlc3Npb246ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5jaGFuZ2VTdGF0ZShDaHJvbWVkcml2ZXIuU1RBVEVfT05MSU5FKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AgKGVtaXRTdGF0ZXMgPSB0cnVlKSB7XG4gICAgaWYgKGVtaXRTdGF0ZXMpIHtcbiAgICAgIHRoaXMuY2hhbmdlU3RhdGUoQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQSU5HKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuandwcm94eS5jb21tYW5kKCcnLCAnREVMRVRFJyk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Muc3RvcCgnU0lHVEVSTScsIDIwMDAwKTtcbiAgICAgIGlmIChlbWl0U3RhdGVzKSB7XG4gICAgICAgIHRoaXMuY2hhbmdlU3RhdGUoQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQRUQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZy5lcnJvcihlKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VTdGF0ZSAoc3RhdGUpIHtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgbG9nLmRlYnVnKGBDaGFuZ2VkIHN0YXRlIHRvICcke3N0YXRlfSdgKTtcbiAgICB0aGlzLmVtaXQoQ2hyb21lZHJpdmVyLkVWRU5UX0NIQU5HRUQsIHtzdGF0ZX0pO1xuICB9XG5cbiAgYXN5bmMgc2VuZENvbW1hbmQgKHVybCwgbWV0aG9kLCBib2R5KSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuandwcm94eS5jb21tYW5kKHVybCwgbWV0aG9kLCBib2R5KTtcbiAgfVxuXG4gIGFzeW5jIHByb3h5UmVxIChyZXEsIHJlcykge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmp3cHJveHkucHJveHlSZXFSZXMocmVxLCByZXMpO1xuICB9XG5cbiAgYXN5bmMga2lsbEFsbCAoKSB7XG4gICAgbGV0IGNtZDtcbiAgICBpZiAoc3lzdGVtLmlzV2luZG93cygpKSB7XG4gICAgICAvLyBqcyBoaW50IGNhbm5vdCBoYW5kbGUgYmFja3RpY2tzLCBldmVuIGVzY2FwZWQsIHdpdGhpbiB0ZW1wbGF0ZSBsaXRlcmFsc1xuICAgICAgY21kID0gXCJGT1IgL0YgXFxcInVzZWJhY2txIHRva2Vucz01XFxcIiAlYSBpbiAoYG5ldHN0YXQgLW5hbyBefCBcIiArXG4gICAgICAgICAgICBcImZpbmRzdHIgL1IgL0M6XFxcIlwiICsgdGhpcy5wcm94eVBvcnQgKyBcIiBcXFwiYCkgZG8gKFwiICtcbiAgICAgICAgICAgIFwiRk9SIC9GIFxcXCJ1c2ViYWNrcVxcXCIgJWIgaW4gKGBUQVNLTElTVCAvRkkgXFxcIlBJRCBlcSAlYVxcXCIgXnwgXCIgK1xuICAgICAgICAgICAgXCJmaW5kc3RyIC9JIGNocm9tZWRyaXZlci5leGVgKSBkbyAoSUYgTk9UICViPT1cXFwiXFxcIiBUQVNLS0lMTCBcIiArXG4gICAgICAgICAgICBcIi9GIC9QSUQgJWEpKVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbWQgPSBgcGtpbGwgLTE1IC1mIFwiJHt0aGlzLmNocm9tZWRyaXZlcn0uKi0tcG9ydD0ke3RoaXMucHJveHlQb3J0fVwiYDtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGBLaWxsaW5nIGFueSBvbGQgY2hyb21lZHJpdmVycywgcnVubmluZzogJHtjbWR9YCk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IChCLnByb21pc2lmeShjcC5leGVjKSkoY21kKTtcbiAgICAgIGxvZy5kZWJ1ZyhcIlN1Y2Nlc3NmdWxseSBjbGVhbmVkIHVwIG9sZCBjaHJvbWVkcml2ZXJzXCIpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLndhcm4oXCJObyBvbGQgY2hyb21lZHJpdmVycyBzZWVtZWQgdG8gZXhpc3RcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWRiKSB7XG4gICAgICBsb2cuZGVidWcoYENsZWFuaW5nIGFueSBvbGQgYWRiIGZvcndhcmRlZCBwb3J0IHNvY2tldCBjb25uZWN0aW9uc2ApO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yIChsZXQgY29ubiBvZiBhd2FpdCB0aGlzLmFkYi5nZXRGb3J3YXJkTGlzdCgpKSB7XG4gICAgICAgICAgLy8gY2hyb21lZHJpdmVyIHdpbGwgYXNrIEFEQiB0byBmb3J3YXJkIGEgcG9ydCBsaWtlIFwiZGV2aWNlSWQgdGNwOnBvcnQgbG9jYWxhYnN0cmFjdDp3ZWJ2aWV3X2RldnRvb2xzX3JlbW90ZV9wb3J0XCJcbiAgICAgICAgICBpZiAoY29ubi5pbmRleE9mKCd3ZWJ2aWV3X2RldnRvb2xzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgcGFyYW1zID0gY29ubi5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRiLnJlbW92ZVBvcnRGb3J3YXJkKHBhcmFtc1sxXS5yZXBsYWNlKC9bXFxEXSovLCAnJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZy53YXJuKGBVbmFibGUgdG8gY2xlYW4gZm9yd2FyZGVkIHBvcnRzLiBFcnJvcjogJyR7ZXJyLm1lc3NhZ2V9Jy4gQ29udGludWluZy5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBoYXNXb3JraW5nV2VidmlldyAoKSB7XG4gICAgLy8gc29tZXRpbWVzIGNocm9tZWRyaXZlciBzdG9wcyBhdXRvbWF0aW5nIHdlYnZpZXdzLiB0aGlzIG1ldGhvZCBydW5zIGFcbiAgICAvLyBzaW1wbGUgY29tbWFuZCB0byBkZXRlcm1pbmUgb3VyIHN0YXRlLCBhbmQgcmVzcG9uZHMgYWNjb3JkaW5nbHlcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5qd3Byb3h5LmNvbW1hbmQoJy91cmwnLCAnR0VUJyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbkNocm9tZWRyaXZlci5FVkVOVF9FUlJPUiA9ICdjaHJvbWVkcml2ZXJfZXJyb3InO1xuQ2hyb21lZHJpdmVyLkVWRU5UX0NIQU5HRUQgPSAnc3RhdGVDaGFuZ2VkJztcbkNocm9tZWRyaXZlci5TVEFURV9TVE9QUEVEID0gJ3N0b3BwZWQnO1xuQ2hyb21lZHJpdmVyLlNUQVRFX1NUQVJUSU5HID0gJ3N0YXJ0aW5nJztcbkNocm9tZWRyaXZlci5TVEFURV9PTkxJTkUgPSAnb25saW5lJztcbkNocm9tZWRyaXZlci5TVEFURV9TVE9QUElORyA9ICdzdG9wcGluZyc7XG5DaHJvbWVkcml2ZXIuU1RBVEVfUkVTVEFSVElORyA9ICdyZXN0YXJ0aW5nJztcblxuZXhwb3J0IGRlZmF1bHQgQ2hyb21lZHJpdmVyO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLiJ9
