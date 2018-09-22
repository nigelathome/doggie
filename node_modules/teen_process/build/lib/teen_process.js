/* eslint-disable promise/prefer-await-to-callbacks */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _shellQuote = require('shell-quote');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _through = require('through');

var _through2 = _interopRequireDefault(_through);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var EventEmitter = _events2['default'].EventEmitter;

function exec(cmd) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  // get a quoted representation of the command for error strings
  var rep = (0, _shellQuote.quote)([cmd].concat(args));

  // extend default options; we're basically re-implementing exec's options
  // for use here with spawn under the hood
  opts = _Object$assign({
    timeout: null,
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    cwd: undefined,
    env: process.env,
    ignoreOutput: false,
    stdio: "inherit",
    isBuffer: false,
    shell: undefined
  }, opts);

  // this is an async function, so return a promise
  return new _bluebird2['default'](function (resolve, reject) {
    // spawn the child process with options; we don't currently expose any of
    // the other 'spawn' options through the API
    var proc = (0, _child_process.spawn)(cmd, args, { cwd: opts.cwd, env: opts.env, shell: opts.shell });
    var stdoutArr = [],
        stderrArr = [],
        timer = null;

    // if the process errors out, reject the promise
    proc.on('error', function (err) {
      var msg = 'Command \'' + rep + '\' errored out: ' + err.stack;
      if (err.errno === 'ENOENT') {
        msg = 'Command \'' + cmd + '\' not found. Is it installed?';
      }
      reject(new Error(msg));
    });
    if (proc.stdin) {
      proc.stdin.on('error', function (err) {
        reject(new Error('Standard input \'' + err.syscall + '\' error: ' + err.stack));
      });
    }
    if (proc.stdout) {
      proc.stdout.on('error', function (err) {
        reject(new Error('Standard output \'' + err.syscall + '\' error: ' + err.stack));
      });
    }
    if (proc.stderr) {
      proc.stderr.on('error', function (err) {
        reject(new Error('Standard error \'' + err.syscall + '\' error: ' + err.stack));
      });
    }

    // keep track of stdout/stderr if we haven't said not to
    if (!opts.ignoreOutput) {
      if (proc.stdout) {
        proc.stdout.on('data', function (data) {
          stdoutArr.push(data);
        });
      }
      if (proc.stderr) {
        proc.stderr.on('data', function (data) {
          stderrArr.push(data);
        });
      }
    }

    function getStdio(isBuffer) {
      var stdout = undefined,
          stderr = undefined;
      if (isBuffer) {
        stdout = Buffer.concat(stdoutArr);
        stderr = Buffer.concat(stderrArr);
      } else {
        stdout = Buffer.concat(stdoutArr).toString(opts.encoding);
        stderr = Buffer.concat(stderrArr).toString(opts.encoding);
      }
      return { stdout: stdout, stderr: stderr };
    }

    // if the process ends, either resolve or reject the promise based on the
    // exit code of the process. either way, attach stdout, stderr, and code.
    // Also clean up the timer if it exists
    proc.on('close', function (code) {
      if (timer) {
        clearTimeout(timer);
      }

      var _getStdio = getStdio(opts.isBuffer);

      var stdout = _getStdio.stdout;
      var stderr = _getStdio.stderr;

      if (code === 0) {
        resolve({ stdout: stdout, stderr: stderr, code: code });
      } else {
        var err = new Error('Command \'' + rep + '\' exited with code ' + code);
        err = _Object$assign(err, { stdout: stdout, stderr: stderr, code: code });
        reject(err);
      }
    });

    // if we set a timeout on the child process, cut into the execution and
    // reject if the timeout is reached. Attach the stdout/stderr we currently
    // have in case it's helpful in debugging
    if (opts.timeout) {
      timer = setTimeout(function () {
        var _getStdio2 = getStdio(opts.isBuffer);

        var stdout = _getStdio2.stdout;
        var stderr = _getStdio2.stderr;

        var err = new Error('Command \'' + rep + '\' timed out after ' + opts.timeout + 'ms');
        err = _Object$assign(err, { stdout: stdout, stderr: stderr, code: null });
        reject(err);
        // reject and THEN kill to avoid race conditions with the handlers
        // above
        proc.kill(opts.killSignal);
      }, opts.timeout);
    }
  });
}

var SubProcess = (function (_EventEmitter) {
  _inherits(SubProcess, _EventEmitter);

  function SubProcess(cmd) {
    var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, SubProcess);

    _get(Object.getPrototypeOf(SubProcess.prototype), 'constructor', this).call(this);
    if (!cmd) throw new Error("Command is required"); // eslint-disable-line curly
    if (typeof cmd !== "string") throw new Error("Command must be a string"); // eslint-disable-line curly
    if (!(args instanceof Array)) throw new Error("Args must be an array"); // eslint-disable-line curly
    this.cmd = cmd;
    this.args = args;
    this.proc = null;
    this.opts = opts;
  }

  _createClass(SubProcess, [{
    key: 'start',

    // spawn the subprocess and return control whenever we deem that it has fully
    // "started"
    value: function start() {
      var startDetector = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var timeoutMs = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
      var startDelay;
      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            startDelay = 10;

            // the default start detector simply returns true when we get any output
            if (startDetector === null) {
              startDetector = function (stdout, stderr) {
                return stdout || stderr;
              };
            }

            // if the user passes a number, then we simply delay a certain amount of
            // time before returning control, rather than waiting for a condition
            if (typeof startDetector === 'number') {
              startDelay = startDetector;
              startDetector = null;
            }

            // return a promise so we can wrap the async behavior
            return context$2$0.abrupt('return', new _bluebird2['default'](function (resolve, reject) {
              try {
                // actually spawn the subproc
                _this.proc = (0, _child_process.spawn)(_this.cmd, _this.args, _this.opts);
              } catch (e) {
                reject(e);
              }
              if (_this.proc.stdout) {
                _this.proc.stdout.setEncoding(_this.opts.encoding || 'utf8');
              }
              if (_this.proc.stderr) {
                _this.proc.stderr.setEncoding(_this.opts.encoding || 'utf8');
              }
              _this.lastLinePortion = { stdout: "", stderr: "" };

              // this function handles output that we collect from the subproc
              var handleOutput = function handleOutput(data) {
                // if we have a startDetector, run it on the output so we can resolve/
                // reject and move on from start
                try {
                  if (startDetector && startDetector(data.stdout, data.stderr)) {
                    startDetector = null;
                    resolve();
                  }
                } catch (e) {
                  reject(e);
                }

                // emit the actual output for whomever's listening
                _this.emit('output', data.stdout, data.stderr);

                // we also want to emit lines, but it's more complex since output
                // comes in chunks and a line could come in two different chunks, so
                // we have logic to handle that case (using this.lastLinePortion to
                // remember a line that started but did not finish in the last chunk)
                var _arr = ['stdout', 'stderr'];
                for (var _i = 0; _i < _arr.length; _i++) {
                  var stream = _arr[_i];
                  if (!data[stream]) continue; // eslint-disable-line curly
                  var lines = data[stream].split("\n");
                  if (lines.length > 1) {
                    var retLines = lines.slice(0, -1);
                    retLines[0] = _this.lastLinePortion[stream] + retLines[0];
                    _this.lastLinePortion[stream] = lines[lines.length - 1];
                    _this.emit('lines-' + stream, retLines);
                  } else {
                    _this.lastLinePortion[stream] += lines[0];
                  }
                }
              };

              // if we get an error spawning the proc, reject and clean up the proc
              _this.proc.on('error', function (err) {
                _this.proc.removeAllListeners('exit');
                _this.proc.kill('SIGINT');

                if (err.errno === 'ENOENT') {
                  err = new Error('Command \'' + _this.cmd + '\' not found. Is it installed?');
                }
                reject(err);
              });

              if (_this.proc.stdout) {
                _this.proc.stdout.pipe((0, _through2['default'])(function (stdout) {
                  handleOutput({ stdout: stdout, stderr: '' });
                }));
              }

              if (_this.proc.stderr) {
                _this.proc.stderr.pipe((0, _through2['default'])(function (stderr) {
                  handleOutput({ stdout: '', stderr: stderr });
                }));
              }

              // when the proc exits, we might still have a buffer of lines we were
              // waiting on more chunks to complete. Go ahead and emit those, then
              // re-emit the exit so a listener can handle the possibly-unexpected exit
              _this.proc.on('exit', function (code, signal) {
                _this.handleLastLines();
                _this.emit('exit', code, signal);
                _this.proc = null;
              });

              // if the user hasn't given us a startDetector, instead just resolve
              // when startDelay ms have passed
              if (!startDetector) {
                setTimeout(function () {
                  resolve();
                }, startDelay);
              }

              // if the user has given us a timeout, start the clock for rejecting
              // the promise if we take too long to start
              if (typeof timeoutMs === "number") {
                setTimeout(function () {
                  reject(new Error("The process did not start in the allotted time " + ('(' + timeoutMs + 'ms)')));
                }, timeoutMs);
              }
            }));

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'handleLastLines',
    value: function handleLastLines() {
      var _arr2 = ['stdout', 'stderr'];

      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var stream = _arr2[_i2];
        if (this.lastLinePortion[stream]) {
          this.emit('lines-' + stream, [this.lastLinePortion[stream]]);
          this.lastLinePortion[stream] = '';
        }
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      var signal = arguments.length <= 0 || arguments[0] === undefined ? 'SIGTERM' : arguments[0];
      var timeout = arguments.length <= 1 || arguments[1] === undefined ? 10000 : arguments[1];
      return _regeneratorRuntime.async(function stop$(context$2$0) {
        var _this2 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (this.isRunning) {
              context$2$0.next = 2;
              break;
            }

            throw new Error('Can\'t stop process; it\'s not currently running (cmd: \'' + this.cmd + '\')');

          case 2:
            // make sure to emit any data in our lines buffer whenever we're done with
            // the proc
            this.handleLastLines();
            return context$2$0.abrupt('return', new _bluebird2['default'](function (resolve, reject) {
              _this2.proc.on('close', resolve);
              _this2.proc.kill(signal);
              setTimeout(function () {
                reject(new Error('Process didn\'t end after ' + timeout + 'ms'));
              }, timeout);
            }));

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'join',
    value: function join() {
      var allowedExitCodes = arguments.length <= 0 || arguments[0] === undefined ? [0] : arguments[0];
      return _regeneratorRuntime.async(function join$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (this.isRunning) {
              context$2$0.next = 2;
              break;
            }

            throw new Error("Can't join process; it's not currently running");

          case 2:
            return context$2$0.abrupt('return', new _bluebird2['default'](function (resolve, reject) {
              _this3.proc.on('exit', function (code) {
                if (allowedExitCodes.indexOf(code) === -1) {
                  reject(new Error('Process ended with exitcode ' + code));
                } else {
                  resolve(code);
                }
              });
            }));

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'isRunning',
    get: function get() {
      // presence of `proc` means we have connected and started
      return !!this.proc;
    }
  }]);

  return SubProcess;
})(EventEmitter);

exports.exec = exec;
exports.spawn = _child_process.spawn;
exports.SubProcess = SubProcess;
//# sourceMappingURL=data:application/json;charset=utf8;base64,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cEthLGVBQUc7O0FBRWYsYUFBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNwQjs7O1NBZkcsVUFBVTtHQUFTLFlBQVk7O1FBbUw1QixJQUFJLEdBQUosSUFBSTtRQUFFLEtBQUs7UUFBRSxVQUFVLEdBQVYsVUFBVSIsImZpbGUiOiJsaWIvdGVlbl9wcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgcHJvbWlzZS9wcmVmZXItYXdhaXQtdG8tY2FsbGJhY2tzICovXG5cbmltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBxdW90ZSB9IGZyb20gJ3NoZWxsLXF1b3RlJztcbmltcG9ydCBldmVudHMgZnJvbSAnZXZlbnRzJztcbmltcG9ydCB0aHJvdWdoIGZyb20gJ3Rocm91Z2gnO1xuY29uc3QgeyBFdmVudEVtaXR0ZXIgfSA9IGV2ZW50cztcbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcblxuXG5mdW5jdGlvbiBleGVjIChjbWQsIGFyZ3MgPSBbXSwgb3B0cyA9IHt9KSB7XG4gIC8vIGdldCBhIHF1b3RlZCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29tbWFuZCBmb3IgZXJyb3Igc3RyaW5nc1xuICBsZXQgcmVwID0gcXVvdGUoW2NtZF0uY29uY2F0KGFyZ3MpKTtcblxuICAvLyBleHRlbmQgZGVmYXVsdCBvcHRpb25zOyB3ZSdyZSBiYXNpY2FsbHkgcmUtaW1wbGVtZW50aW5nIGV4ZWMncyBvcHRpb25zXG4gIC8vIGZvciB1c2UgaGVyZSB3aXRoIHNwYXduIHVuZGVyIHRoZSBob29kXG4gIG9wdHMgPSBPYmplY3QuYXNzaWduKHtcbiAgICB0aW1lb3V0OiBudWxsLFxuICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAga2lsbFNpZ25hbDogJ1NJR1RFUk0nLFxuICAgIGN3ZDogdW5kZWZpbmVkLFxuICAgIGVudjogcHJvY2Vzcy5lbnYsXG4gICAgaWdub3JlT3V0cHV0OiBmYWxzZSxcbiAgICBzdGRpbzogXCJpbmhlcml0XCIsXG4gICAgaXNCdWZmZXI6IGZhbHNlLFxuICAgIHNoZWxsOiB1bmRlZmluZWQsXG4gIH0sIG9wdHMpO1xuXG4gIC8vIHRoaXMgaXMgYW4gYXN5bmMgZnVuY3Rpb24sIHNvIHJldHVybiBhIHByb21pc2VcbiAgcmV0dXJuIG5ldyBCKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBzcGF3biB0aGUgY2hpbGQgcHJvY2VzcyB3aXRoIG9wdGlvbnM7IHdlIGRvbid0IGN1cnJlbnRseSBleHBvc2UgYW55IG9mXG4gICAgLy8gdGhlIG90aGVyICdzcGF3bicgb3B0aW9ucyB0aHJvdWdoIHRoZSBBUElcbiAgICBsZXQgcHJvYyA9IHNwYXduKGNtZCwgYXJncywge2N3ZDogb3B0cy5jd2QsIGVudjogb3B0cy5lbnYsIHNoZWxsOiBvcHRzLnNoZWxsfSk7XG4gICAgbGV0IHN0ZG91dEFyciA9IFtdLCBzdGRlcnJBcnIgPSBbXSwgdGltZXIgPSBudWxsO1xuXG4gICAgLy8gaWYgdGhlIHByb2Nlc3MgZXJyb3JzIG91dCwgcmVqZWN0IHRoZSBwcm9taXNlXG4gICAgcHJvYy5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICBsZXQgbXNnID0gYENvbW1hbmQgJyR7cmVwfScgZXJyb3JlZCBvdXQ6ICR7ZXJyLnN0YWNrfWA7XG4gICAgICBpZiAoZXJyLmVycm5vID09PSAnRU5PRU5UJykge1xuICAgICAgICBtc2cgPSBgQ29tbWFuZCAnJHtjbWR9JyBub3QgZm91bmQuIElzIGl0IGluc3RhbGxlZD9gO1xuICAgICAgfVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihtc2cpKTtcbiAgICB9KTtcbiAgICBpZiAocHJvYy5zdGRpbikge1xuICAgICAgcHJvYy5zdGRpbi5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFN0YW5kYXJkIGlucHV0ICcke2Vyci5zeXNjYWxsfScgZXJyb3I6ICR7ZXJyLnN0YWNrfWApKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAocHJvYy5zdGRvdXQpIHtcbiAgICAgIHByb2Muc3Rkb3V0Lm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU3RhbmRhcmQgb3V0cHV0ICcke2Vyci5zeXNjYWxsfScgZXJyb3I6ICR7ZXJyLnN0YWNrfWApKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAocHJvYy5zdGRlcnIpIHtcbiAgICAgIHByb2Muc3RkZXJyLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU3RhbmRhcmQgZXJyb3IgJyR7ZXJyLnN5c2NhbGx9JyBlcnJvcjogJHtlcnIuc3RhY2t9YCkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8ga2VlcCB0cmFjayBvZiBzdGRvdXQvc3RkZXJyIGlmIHdlIGhhdmVuJ3Qgc2FpZCBub3QgdG9cbiAgICBpZiAoIW9wdHMuaWdub3JlT3V0cHV0KSB7XG4gICAgICBpZiAocHJvYy5zdGRvdXQpIHtcbiAgICAgICAgcHJvYy5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIHN0ZG91dEFyci5wdXNoKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm9jLnN0ZGVycikge1xuICAgICAgICBwcm9jLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgc3RkZXJyQXJyLnB1c2goZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFN0ZGlvIChpc0J1ZmZlcikge1xuICAgICAgbGV0IHN0ZG91dCwgc3RkZXJyO1xuICAgICAgaWYgKGlzQnVmZmVyKSB7XG4gICAgICAgIHN0ZG91dCA9IEJ1ZmZlci5jb25jYXQoc3Rkb3V0QXJyKTtcbiAgICAgICAgc3RkZXJyID0gQnVmZmVyLmNvbmNhdChzdGRlcnJBcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3Rkb3V0ID0gQnVmZmVyLmNvbmNhdChzdGRvdXRBcnIpLnRvU3RyaW5nKG9wdHMuZW5jb2RpbmcpO1xuICAgICAgICBzdGRlcnIgPSBCdWZmZXIuY29uY2F0KHN0ZGVyckFycikudG9TdHJpbmcob3B0cy5lbmNvZGluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge3N0ZG91dCwgc3RkZXJyfTtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgcHJvY2VzcyBlbmRzLCBlaXRoZXIgcmVzb2x2ZSBvciByZWplY3QgdGhlIHByb21pc2UgYmFzZWQgb24gdGhlXG4gICAgLy8gZXhpdCBjb2RlIG9mIHRoZSBwcm9jZXNzLiBlaXRoZXIgd2F5LCBhdHRhY2ggc3Rkb3V0LCBzdGRlcnIsIGFuZCBjb2RlLlxuICAgIC8vIEFsc28gY2xlYW4gdXAgdGhlIHRpbWVyIGlmIGl0IGV4aXN0c1xuICAgIHByb2Mub24oJ2Nsb3NlJywgKGNvZGUpID0+IHtcbiAgICAgIGlmICh0aW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgfVxuICAgICAgbGV0IHtzdGRvdXQsIHN0ZGVycn0gPSBnZXRTdGRpbyhvcHRzLmlzQnVmZmVyKTtcbiAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgIHJlc29sdmUoe3N0ZG91dCwgc3RkZXJyLCBjb2RlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZXJyID0gbmV3IEVycm9yKGBDb21tYW5kICcke3JlcH0nIGV4aXRlZCB3aXRoIGNvZGUgJHtjb2RlfWApO1xuICAgICAgICBlcnIgPSBPYmplY3QuYXNzaWduKGVyciwge3N0ZG91dCwgc3RkZXJyLCBjb2RlfSk7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgd2Ugc2V0IGEgdGltZW91dCBvbiB0aGUgY2hpbGQgcHJvY2VzcywgY3V0IGludG8gdGhlIGV4ZWN1dGlvbiBhbmRcbiAgICAvLyByZWplY3QgaWYgdGhlIHRpbWVvdXQgaXMgcmVhY2hlZC4gQXR0YWNoIHRoZSBzdGRvdXQvc3RkZXJyIHdlIGN1cnJlbnRseVxuICAgIC8vIGhhdmUgaW4gY2FzZSBpdCdzIGhlbHBmdWwgaW4gZGVidWdnaW5nXG4gICAgaWYgKG9wdHMudGltZW91dCkge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbGV0IHtzdGRvdXQsIHN0ZGVycn0gPSBnZXRTdGRpbyhvcHRzLmlzQnVmZmVyKTtcbiAgICAgICAgbGV0IGVyciA9IG5ldyBFcnJvcihgQ29tbWFuZCAnJHtyZXB9JyB0aW1lZCBvdXQgYWZ0ZXIgJHtvcHRzLnRpbWVvdXR9bXNgKTtcbiAgICAgICAgZXJyID0gT2JqZWN0LmFzc2lnbihlcnIsIHtzdGRvdXQsIHN0ZGVyciwgY29kZTogbnVsbH0pO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgLy8gcmVqZWN0IGFuZCBUSEVOIGtpbGwgdG8gYXZvaWQgcmFjZSBjb25kaXRpb25zIHdpdGggdGhlIGhhbmRsZXJzXG4gICAgICAgIC8vIGFib3ZlXG4gICAgICAgIHByb2Mua2lsbChvcHRzLmtpbGxTaWduYWwpO1xuICAgICAgfSwgb3B0cy50aW1lb3V0KTtcbiAgICB9XG4gIH0pO1xufVxuXG5jbGFzcyBTdWJQcm9jZXNzIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKGNtZCwgYXJncyA9IFtdLCBvcHRzID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIGlmICghY21kKSB0aHJvdyBuZXcgRXJyb3IoXCJDb21tYW5kIGlzIHJlcXVpcmVkXCIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGN1cmx5XG4gICAgaWYgKHR5cGVvZiBjbWQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBFcnJvcihcIkNvbW1hbmQgbXVzdCBiZSBhIHN0cmluZ1wiKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjdXJseVxuICAgIGlmICghKGFyZ3MgaW5zdGFuY2VvZiBBcnJheSkpIHRocm93IG5ldyBFcnJvcihcIkFyZ3MgbXVzdCBiZSBhbiBhcnJheVwiKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjdXJseVxuICAgIHRoaXMuY21kID0gY21kO1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5wcm9jID0gbnVsbDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICB9XG5cbiAgZ2V0IGlzUnVubmluZyAoKSB7XG4gICAgLy8gcHJlc2VuY2Ugb2YgYHByb2NgIG1lYW5zIHdlIGhhdmUgY29ubmVjdGVkIGFuZCBzdGFydGVkXG4gICAgcmV0dXJuICEhdGhpcy5wcm9jO1xuICB9XG5cbiAgLy8gc3Bhd24gdGhlIHN1YnByb2Nlc3MgYW5kIHJldHVybiBjb250cm9sIHdoZW5ldmVyIHdlIGRlZW0gdGhhdCBpdCBoYXMgZnVsbHlcbiAgLy8gXCJzdGFydGVkXCJcbiAgYXN5bmMgc3RhcnQgKHN0YXJ0RGV0ZWN0b3IgPSBudWxsLCB0aW1lb3V0TXMgPSBudWxsKSB7XG4gICAgbGV0IHN0YXJ0RGVsYXkgPSAxMDtcblxuICAgIC8vIHRoZSBkZWZhdWx0IHN0YXJ0IGRldGVjdG9yIHNpbXBseSByZXR1cm5zIHRydWUgd2hlbiB3ZSBnZXQgYW55IG91dHB1dFxuICAgIGlmIChzdGFydERldGVjdG9yID09PSBudWxsKSB7XG4gICAgICBzdGFydERldGVjdG9yID0gKHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgIHJldHVybiBzdGRvdXQgfHwgc3RkZXJyO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgdXNlciBwYXNzZXMgYSBudW1iZXIsIHRoZW4gd2Ugc2ltcGx5IGRlbGF5IGEgY2VydGFpbiBhbW91bnQgb2ZcbiAgICAvLyB0aW1lIGJlZm9yZSByZXR1cm5pbmcgY29udHJvbCwgcmF0aGVyIHRoYW4gd2FpdGluZyBmb3IgYSBjb25kaXRpb25cbiAgICBpZiAodHlwZW9mIHN0YXJ0RGV0ZWN0b3IgPT09ICdudW1iZXInKSB7XG4gICAgICBzdGFydERlbGF5ID0gc3RhcnREZXRlY3RvcjtcbiAgICAgIHN0YXJ0RGV0ZWN0b3IgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBhIHByb21pc2Ugc28gd2UgY2FuIHdyYXAgdGhlIGFzeW5jIGJlaGF2aW9yXG4gICAgcmV0dXJuIG5ldyBCKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGFjdHVhbGx5IHNwYXduIHRoZSBzdWJwcm9jXG4gICAgICAgIHRoaXMucHJvYyA9IHNwYXduKHRoaXMuY21kLCB0aGlzLmFyZ3MsIHRoaXMub3B0cyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnByb2Muc3Rkb3V0KSB7XG4gICAgICAgIHRoaXMucHJvYy5zdGRvdXQuc2V0RW5jb2RpbmcodGhpcy5vcHRzLmVuY29kaW5nIHx8ICd1dGY4Jyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9jLnN0ZGVycikge1xuICAgICAgICB0aGlzLnByb2Muc3RkZXJyLnNldEVuY29kaW5nKHRoaXMub3B0cy5lbmNvZGluZyB8fCAndXRmOCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5sYXN0TGluZVBvcnRpb24gPSB7c3Rkb3V0OiBcIlwiLCBzdGRlcnI6IFwiXCJ9O1xuXG4gICAgICAvLyB0aGlzIGZ1bmN0aW9uIGhhbmRsZXMgb3V0cHV0IHRoYXQgd2UgY29sbGVjdCBmcm9tIHRoZSBzdWJwcm9jXG4gICAgICBjb25zdCBoYW5kbGVPdXRwdXQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgc3RhcnREZXRlY3RvciwgcnVuIGl0IG9uIHRoZSBvdXRwdXQgc28gd2UgY2FuIHJlc29sdmUvXG4gICAgICAgIC8vIHJlamVjdCBhbmQgbW92ZSBvbiBmcm9tIHN0YXJ0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHN0YXJ0RGV0ZWN0b3IgJiYgc3RhcnREZXRlY3RvcihkYXRhLnN0ZG91dCwgZGF0YS5zdGRlcnIpKSB7XG4gICAgICAgICAgICBzdGFydERldGVjdG9yID0gbnVsbDtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbWl0IHRoZSBhY3R1YWwgb3V0cHV0IGZvciB3aG9tZXZlcidzIGxpc3RlbmluZ1xuICAgICAgICB0aGlzLmVtaXQoJ291dHB1dCcsIGRhdGEuc3Rkb3V0LCBkYXRhLnN0ZGVycik7XG5cbiAgICAgICAgLy8gd2UgYWxzbyB3YW50IHRvIGVtaXQgbGluZXMsIGJ1dCBpdCdzIG1vcmUgY29tcGxleCBzaW5jZSBvdXRwdXRcbiAgICAgICAgLy8gY29tZXMgaW4gY2h1bmtzIGFuZCBhIGxpbmUgY291bGQgY29tZSBpbiB0d28gZGlmZmVyZW50IGNodW5rcywgc29cbiAgICAgICAgLy8gd2UgaGF2ZSBsb2dpYyB0byBoYW5kbGUgdGhhdCBjYXNlICh1c2luZyB0aGlzLmxhc3RMaW5lUG9ydGlvbiB0b1xuICAgICAgICAvLyByZW1lbWJlciBhIGxpbmUgdGhhdCBzdGFydGVkIGJ1dCBkaWQgbm90IGZpbmlzaCBpbiB0aGUgbGFzdCBjaHVuaylcbiAgICAgICAgZm9yIChsZXQgc3RyZWFtIG9mIFsnc3Rkb3V0JywgJ3N0ZGVyciddKSB7XG4gICAgICAgICAgaWYgKCFkYXRhW3N0cmVhbV0pIGNvbnRpbnVlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGN1cmx5XG4gICAgICAgICAgbGV0IGxpbmVzID0gZGF0YVtzdHJlYW1dLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgcmV0TGluZXMgPSBsaW5lcy5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICByZXRMaW5lc1swXSA9IHRoaXMubGFzdExpbmVQb3J0aW9uW3N0cmVhbV0gKyByZXRMaW5lc1swXTtcbiAgICAgICAgICAgIHRoaXMubGFzdExpbmVQb3J0aW9uW3N0cmVhbV0gPSBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChgbGluZXMtJHtzdHJlYW19YCwgcmV0TGluZXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RMaW5lUG9ydGlvbltzdHJlYW1dICs9IGxpbmVzWzBdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gaWYgd2UgZ2V0IGFuIGVycm9yIHNwYXduaW5nIHRoZSBwcm9jLCByZWplY3QgYW5kIGNsZWFuIHVwIHRoZSBwcm9jXG4gICAgICB0aGlzLnByb2Mub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgICAgdGhpcy5wcm9jLnJlbW92ZUFsbExpc3RlbmVycygnZXhpdCcpO1xuICAgICAgICB0aGlzLnByb2Mua2lsbCgnU0lHSU5UJyk7XG5cbiAgICAgICAgaWYgKGVyci5lcnJubyA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoYENvbW1hbmQgJyR7dGhpcy5jbWR9JyBub3QgZm91bmQuIElzIGl0IGluc3RhbGxlZD9gKTtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5wcm9jLnN0ZG91dCkge1xuICAgICAgICB0aGlzLnByb2Muc3Rkb3V0LnBpcGUodGhyb3VnaChzdGRvdXQgPT4ge1xuICAgICAgICAgIGhhbmRsZU91dHB1dCh7c3Rkb3V0LCBzdGRlcnI6ICcnfSk7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvYy5zdGRlcnIpIHtcbiAgICAgICAgdGhpcy5wcm9jLnN0ZGVyci5waXBlKHRocm91Z2goc3RkZXJyID0+IHtcbiAgICAgICAgICBoYW5kbGVPdXRwdXQoe3N0ZG91dDogJycsIHN0ZGVycn0pO1xuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHdoZW4gdGhlIHByb2MgZXhpdHMsIHdlIG1pZ2h0IHN0aWxsIGhhdmUgYSBidWZmZXIgb2YgbGluZXMgd2Ugd2VyZVxuICAgICAgLy8gd2FpdGluZyBvbiBtb3JlIGNodW5rcyB0byBjb21wbGV0ZS4gR28gYWhlYWQgYW5kIGVtaXQgdGhvc2UsIHRoZW5cbiAgICAgIC8vIHJlLWVtaXQgdGhlIGV4aXQgc28gYSBsaXN0ZW5lciBjYW4gaGFuZGxlIHRoZSBwb3NzaWJseS11bmV4cGVjdGVkIGV4aXRcbiAgICAgIHRoaXMucHJvYy5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVMYXN0TGluZXMoKTtcbiAgICAgICAgdGhpcy5lbWl0KCdleGl0JywgY29kZSwgc2lnbmFsKTtcbiAgICAgICAgdGhpcy5wcm9jID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBpZiB0aGUgdXNlciBoYXNuJ3QgZ2l2ZW4gdXMgYSBzdGFydERldGVjdG9yLCBpbnN0ZWFkIGp1c3QgcmVzb2x2ZVxuICAgICAgLy8gd2hlbiBzdGFydERlbGF5IG1zIGhhdmUgcGFzc2VkXG4gICAgICBpZiAoIXN0YXJ0RGV0ZWN0b3IpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9LCBzdGFydERlbGF5KTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIHVzZXIgaGFzIGdpdmVuIHVzIGEgdGltZW91dCwgc3RhcnQgdGhlIGNsb2NrIGZvciByZWplY3RpbmdcbiAgICAgIC8vIHRoZSBwcm9taXNlIGlmIHdlIHRha2UgdG9vIGxvbmcgdG8gc3RhcnRcbiAgICAgIGlmICh0eXBlb2YgdGltZW91dE1zID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJUaGUgcHJvY2VzcyBkaWQgbm90IHN0YXJ0IGluIHRoZSBhbGxvdHRlZCB0aW1lIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGAoJHt0aW1lb3V0TXN9bXMpYCkpO1xuICAgICAgICB9LCB0aW1lb3V0TXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlTGFzdExpbmVzICgpIHtcbiAgICBmb3IgKGxldCBzdHJlYW0gb2YgWydzdGRvdXQnLCAnc3RkZXJyJ10pIHtcbiAgICAgIGlmICh0aGlzLmxhc3RMaW5lUG9ydGlvbltzdHJlYW1dKSB7XG4gICAgICAgIHRoaXMuZW1pdChgbGluZXMtJHtzdHJlYW19YCwgW3RoaXMubGFzdExpbmVQb3J0aW9uW3N0cmVhbV1dKTtcbiAgICAgICAgdGhpcy5sYXN0TGluZVBvcnRpb25bc3RyZWFtXSA9ICcnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN0b3AgKHNpZ25hbCA9ICdTSUdURVJNJywgdGltZW91dCA9IDEwMDAwKSB7XG4gICAgaWYgKCF0aGlzLmlzUnVubmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBzdG9wIHByb2Nlc3M7IGl0J3Mgbm90IGN1cnJlbnRseSBydW5uaW5nIChjbWQ6ICcke3RoaXMuY21kfScpYCk7XG4gICAgfVxuICAgIC8vIG1ha2Ugc3VyZSB0byBlbWl0IGFueSBkYXRhIGluIG91ciBsaW5lcyBidWZmZXIgd2hlbmV2ZXIgd2UncmUgZG9uZSB3aXRoXG4gICAgLy8gdGhlIHByb2NcbiAgICB0aGlzLmhhbmRsZUxhc3RMaW5lcygpO1xuICAgIHJldHVybiBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnByb2Mub24oJ2Nsb3NlJywgcmVzb2x2ZSk7XG4gICAgICB0aGlzLnByb2Mua2lsbChzaWduYWwpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFByb2Nlc3MgZGlkbid0IGVuZCBhZnRlciAke3RpbWVvdXR9bXNgKSk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGpvaW4gKGFsbG93ZWRFeGl0Q29kZXMgPSBbMF0pIHtcbiAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBqb2luIHByb2Nlc3M7IGl0J3Mgbm90IGN1cnJlbnRseSBydW5uaW5nXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnByb2Mub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICBpZiAoYWxsb3dlZEV4aXRDb2Rlcy5pbmRleE9mKGNvZGUpID09PSAtMSkge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFByb2Nlc3MgZW5kZWQgd2l0aCBleGl0Y29kZSAke2NvZGV9YCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoY29kZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IGV4ZWMsIHNwYXduLCBTdWJQcm9jZXNzIH07XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uIn0=
