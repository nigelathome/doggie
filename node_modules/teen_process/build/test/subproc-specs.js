require('source-map-support').install();

'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _this = this;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('..');

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _helpers = require('./helpers');

var _appiumSupport = require('appium-support');

// Windows doesn't understand SIGHUP
var stopSignal = _appiumSupport.system.isWindows() ? 'SIGTERM' : 'SIGHUP';
var should = _chai2['default'].should();
_chai2['default'].use(_chaiAsPromised2['default']);

describe('SubProcess', function () {
  it('should throw an error if initialized without a command', function () {
    should['throw'](function () {
      new _.SubProcess();
    });
  });
  it('should throw an error if initialized with a bad command', function () {
    should['throw'](function () {
      new _.SubProcess({ lol: true });
    });
    should['throw'](function () {
      new _.SubProcess(1);
    });
  });
  it('should throw an error if initialized with bad args', function () {
    should['throw'](function () {
      new _.SubProcess('ls', 'foo');
    });
    should['throw'](function () {
      new _.SubProcess('ls', 1);
    });
    should['throw'](function () {
      new _.SubProcess('ls', {});
    });
  });
  it('should default args list to []', function () {
    var x = new _.SubProcess('ls');
    x.args.should.eql([]);
  });
  it('should default opts dict to {}', function () {
    var x = new _.SubProcess('ls');
    x.opts.should.eql({});
  });
  it('should pass opts to spawn', function callee$1$0() {
    var cwd, subproc, lines;
    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          cwd = _path2['default'].resolve((0, _helpers.getFixture)('.'));
          subproc = new _.SubProcess('ls', [], { cwd: cwd });
          lines = [];

          subproc.on('lines-stdout', function (newLines) {
            lines = lines.concat(newLines);
          });
          context$2$0.next = 6;
          return _regeneratorRuntime.awrap(subproc.start(0));

        case 6:
          context$2$0.next = 8;
          return _regeneratorRuntime.awrap(_bluebird2['default'].delay(50));

        case 8:
          lines.should.include('bad_exit.sh');
          lines.should.contain('bigbuffer.js');
          lines.should.contain('echo.sh');

        case 11:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });

  describe('#start', function () {
    it('should throw an error if command fails on startup', function callee$2$0() {
      var s;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            s = new _.SubProcess('blargimarg');
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(s.start().should.eventually.be.rejectedWith(/not found/));

          case 3:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should have a default startDetector of waiting for output', function callee$2$0() {
      var hasData, s;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            hasData = false;
            s = new _.SubProcess('ls');

            s.on('output', function (stdout) {
              if (stdout) {
                hasData = true;
              }
            });
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(s.start());

          case 5:
            hasData.should.be['true'];

          case 6:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should interpret a numeric startDetector as a start timeout', function callee$2$0() {
      var hasData, s;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            hasData = false;
            s = new _.SubProcess((0, _helpers.getFixture)('sleepyproc'), ['ls']);

            s.on('output', function (stdout) {
              if (stdout) {
                hasData = true;
              }
            });
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(s.start(0));

          case 5:
            hasData.should.be['false'];
            context$3$0.next = 8;
            return _regeneratorRuntime.awrap(_bluebird2['default'].delay(1200));

          case 8:
            hasData.should.be['true'];

          case 9:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should fail even with a start timeout of 0 when command is bad', function callee$2$0() {
      var s;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            s = new _.SubProcess('blargimarg');
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(s.start(0).should.eventually.be.rejectedWith(/not found/));

          case 3:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should be able to provide a custom startDetector function', function callee$2$0() {
      var sd, hasData, s;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            sd = function sd(stdout) {
              return stdout;
            };

            hasData = false;
            s = new _.SubProcess('ls');

            s.on('output', function (stdout) {
              if (stdout) {
                hasData = true;
              }
            });
            context$3$0.next = 6;
            return _regeneratorRuntime.awrap(s.start(sd));

          case 6:
            hasData.should.be['true'];

          case 7:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should pass on custom errors from startDetector', function callee$2$0() {
      var sd, s;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            sd = function sd() {
              throw new Error('foo');
            };

            s = new _.SubProcess('ls');
            context$3$0.next = 4;
            return _regeneratorRuntime.awrap(s.start(sd).should.eventually.be.rejectedWith(/foo/));

          case 4:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should time out starts that take longer than specified ms', function callee$2$0() {
      var sd, s, start;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            sd = function sd(stdout) {
              return stdout.indexOf('nothere') !== -1;
            };

            s = new _.SubProcess('ls');
            start = Date.now();
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(s.start(sd, 500).should.eventually.be.rejectedWith(/did not start.+time/i));

          case 5:
            (Date.now() - start).should.be.below(600);

          case 6:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });

  describe('listening for data', function () {
    var subproc = undefined;
    afterEach(function callee$2$0() {
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.prev = 0;
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(subproc.stop());

          case 3:
            context$3$0.next = 7;
            break;

          case 5:
            context$3$0.prev = 5;
            context$3$0.t0 = context$3$0['catch'](0);

          case 7:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this, [[0, 5]]);
    });
    it('should get output as params', function callee$2$0() {
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        var _this2 = this;

        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return _regeneratorRuntime.awrap(new _bluebird2['default'](function callee$3$0(resolve, reject) {
              return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                while (1) switch (context$4$0.prev = context$4$0.next) {
                  case 0:
                    subproc = new _.SubProcess((0, _helpers.getFixture)('sleepyproc'), ['ls', _path2['default'].resolve(__dirname)]);
                    subproc.on('output', function (stdout) {
                      if (stdout && stdout.indexOf('subproc-specs') === -1) {
                        reject();
                      } else {
                        resolve();
                      }
                    });
                    context$4$0.next = 4;
                    return _regeneratorRuntime.awrap(subproc.start());

                  case 4:
                  case 'end':
                    return context$4$0.stop();
                }
              }, null, _this2);
            }).should.eventually.not.be.rejected);

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });
    it('should get output as params', function callee$2$0() {
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        var _this3 = this;

        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return _regeneratorRuntime.awrap(new _bluebird2['default'](function callee$3$0(resolve, reject) {
              return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                while (1) switch (context$4$0.prev = context$4$0.next) {
                  case 0:
                    subproc = new _.SubProcess((0, _helpers.getFixture)('echo'), ['foo', 'bar']);
                    subproc.on('output', function (stdout, stderr) {
                      if (stderr && stderr.indexOf('bar') === -1) {
                        reject();
                      } else {
                        resolve();
                      }
                    });
                    context$4$0.next = 4;
                    return _regeneratorRuntime.awrap(subproc.start());

                  case 4:
                  case 'end':
                    return context$4$0.stop();
                }
              }, null, _this3);
            }));

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    it('should get output by lines', function callee$2$0() {
      var lines;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            subproc = new _.SubProcess('ls', [_path2['default'].resolve(__dirname)]);
            lines = [];

            subproc.on('lines-stdout', function (newLines) {
              lines = lines.concat(newLines);
            });
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(subproc.start(0));

          case 5:
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(_bluebird2['default'].delay(50));

          case 7:
            lines.should.eql(['exec-specs.js', 'fixtures', 'helpers.js', 'subproc-specs.js']);

          case 8:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });

  describe('#stop', function () {
    it('should send the right signal to stop a proc', function callee$2$0() {
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        var _this4 = this;

        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            return context$3$0.abrupt('return', new _bluebird2['default'](function callee$3$0(resolve, reject) {
              var subproc;
              return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                while (1) switch (context$4$0.prev = context$4$0.next) {
                  case 0:
                    subproc = new _.SubProcess('tail', ['-f', _path2['default'].resolve(__filename)]);
                    context$4$0.next = 3;
                    return _regeneratorRuntime.awrap(subproc.start());

                  case 3:
                    subproc.on('exit', function (code, signal) {
                      try {
                        signal.should.equal(stopSignal);
                        resolve();
                      } catch (e) {
                        reject(e);
                      }
                    });
                    context$4$0.next = 6;
                    return _regeneratorRuntime.awrap(subproc.stop(stopSignal));

                  case 6:
                  case 'end':
                    return context$4$0.stop();
                }
              }, null, _this4);
            }));

          case 1:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });

    it('should time out if stop doesnt complete fast enough', function callee$2$0() {
      var subproc;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            subproc = new _.SubProcess((0, _helpers.getFixture)('traphup'), ['tail', '-f', _path2['default'].resolve(__filename)]);
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(subproc.start());

          case 3:
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(subproc.stop(stopSignal, 1).should.eventually.be.rejectedWith(/Process didn't end/));

          case 5:
            context$3$0.prev = 5;
            context$3$0.next = 8;
            return _regeneratorRuntime.awrap((0, _.exec)('kill', ['-9', subproc.proc.pid + 1]));

          case 8:
            context$3$0.next = 12;
            break;

          case 10:
            context$3$0.prev = 10;
            context$3$0.t0 = context$3$0['catch'](5);

          case 12:
            context$3$0.prev = 12;
            context$3$0.next = 15;
            return _regeneratorRuntime.awrap((0, _.exec)('kill', ['-9', subproc.proc.pid]));

          case 15:
            context$3$0.next = 19;
            break;

          case 17:
            context$3$0.prev = 17;
            context$3$0.t1 = context$3$0['catch'](12);

          case 19:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this, [[5, 10], [12, 17]]);
    });

    it('should error if there is no process to stop', function callee$2$0() {
      var subproc;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            subproc = new _.SubProcess('ls');
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(subproc.stop().should.eventually.be.rejectedWith(/Can't stop/));

          case 3:
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(subproc.start());

          case 5:
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(_bluebird2['default'].delay(10));

          case 7:
            context$3$0.next = 9;
            return _regeneratorRuntime.awrap(subproc.stop().should.eventually.be.rejectedWith(/Can't stop/));

          case 9:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });

  describe('#join', function () {
    it('should fail if the #start has not yet been called', function callee$2$0() {
      var proc;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            proc = new _.SubProcess((0, _helpers.getFixture)('sleepyproc.sh'), ['ls']);
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(proc.join().should.eventually.be.rejectedWith(/Can't join/));

          case 3:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });

    it('should wait until the process has been finished', function callee$2$0() {
      var proc, now, diff;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            proc = new _.SubProcess((0, _helpers.getFixture)('sleepyproc'), ['ls']);
            now = Date.now();
            context$3$0.next = 4;
            return _regeneratorRuntime.awrap(proc.start(0));

          case 4:
            context$3$0.next = 6;
            return _regeneratorRuntime.awrap(proc.join());

          case 6:
            diff = Date.now() - now;

            diff.should.be.above(1000);

          case 8:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });

    it('should throw if process ends with a invalid exitcode', function callee$2$0() {
      var proc;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            proc = new _.SubProcess((0, _helpers.getFixture)('bad_exit'));
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(proc.start(0));

          case 3:
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(proc.join().should.eventually.be.rejectedWith(/Process ended with exitcode/));

          case 5:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });

    it('should NOT throw if process ends with a custom allowed exitcode', function callee$2$0() {
      var proc;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            proc = new _.SubProcess((0, _helpers.getFixture)('bad_exit'));
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(proc.start(0));

          case 3:
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(proc.join([1]).should.eventually.be.become(1));

          case 5:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });
});

// need to kill the process
// 1 for the trap, 1 for the tail
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMiLCJmaWxlIjoidGVzdC9zdWJwcm9jLXNwZWNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHJhbnNwaWxlOm1vY2hhXG5cbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhlYywgU3ViUHJvY2VzcyB9IGZyb20gJy4uJztcbmltcG9ydCBjaGFpIGZyb20gJ2NoYWknO1xuaW1wb3J0IGNoYWlBc1Byb21pc2VkIGZyb20gJ2NoYWktYXMtcHJvbWlzZWQnO1xuaW1wb3J0IHsgZ2V0Rml4dHVyZSB9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgeyBzeXN0ZW0gfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5cblxuLy8gV2luZG93cyBkb2Vzbid0IHVuZGVyc3RhbmQgU0lHSFVQXG5sZXQgc3RvcFNpZ25hbCA9IHN5c3RlbS5pc1dpbmRvd3MoKSA/ICdTSUdURVJNJyA6ICdTSUdIVVAnO1xuY29uc3Qgc2hvdWxkID0gY2hhaS5zaG91bGQoKTtcbmNoYWkudXNlKGNoYWlBc1Byb21pc2VkKTtcblxuZGVzY3JpYmUoJ1N1YlByb2Nlc3MnLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgaW5pdGlhbGl6ZWQgd2l0aG91dCBhIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgc2hvdWxkLnRocm93KCgpID0+IHtcbiAgICAgIG5ldyBTdWJQcm9jZXNzKCk7XG4gICAgfSk7XG4gIH0pO1xuICBpdCgnc2hvdWxkIHRocm93IGFuIGVycm9yIGlmIGluaXRpYWxpemVkIHdpdGggYSBiYWQgY29tbWFuZCcsICgpID0+IHtcbiAgICBzaG91bGQudGhyb3coKCkgPT4ge1xuICAgICAgbmV3IFN1YlByb2Nlc3Moe2xvbDogdHJ1ZX0pO1xuICAgIH0pO1xuICAgIHNob3VsZC50aHJvdygoKSA9PiB7XG4gICAgICBuZXcgU3ViUHJvY2VzcygxKTtcbiAgICB9KTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgaW5pdGlhbGl6ZWQgd2l0aCBiYWQgYXJncycsICgpID0+IHtcbiAgICBzaG91bGQudGhyb3coKCkgPT4ge1xuICAgICAgbmV3IFN1YlByb2Nlc3MoJ2xzJywgJ2ZvbycpO1xuICAgIH0pO1xuICAgIHNob3VsZC50aHJvdygoKSA9PiB7XG4gICAgICBuZXcgU3ViUHJvY2VzcygnbHMnLCAxKTtcbiAgICB9KTtcbiAgICBzaG91bGQudGhyb3coKCkgPT4ge1xuICAgICAgbmV3IFN1YlByb2Nlc3MoJ2xzJywge30pO1xuICAgIH0pO1xuICB9KTtcbiAgaXQoJ3Nob3VsZCBkZWZhdWx0IGFyZ3MgbGlzdCB0byBbXScsICgpID0+IHtcbiAgICBsZXQgeCA9IG5ldyBTdWJQcm9jZXNzKCdscycpO1xuICAgIHguYXJncy5zaG91bGQuZXFsKFtdKTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgZGVmYXVsdCBvcHRzIGRpY3QgdG8ge30nLCAoKSA9PiB7XG4gICAgbGV0IHggPSBuZXcgU3ViUHJvY2VzcygnbHMnKTtcbiAgICB4Lm9wdHMuc2hvdWxkLmVxbCh7fSk7XG4gIH0pO1xuICBpdCgnc2hvdWxkIHBhc3Mgb3B0cyB0byBzcGF3bicsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjd2QgPSBwYXRoLnJlc29sdmUoZ2V0Rml4dHVyZSgnLicpKTtcbiAgICBjb25zdCBzdWJwcm9jID0gbmV3IFN1YlByb2Nlc3MoJ2xzJywgW10sIHtjd2R9KTtcbiAgICBsZXQgbGluZXMgPSBbXTtcbiAgICBzdWJwcm9jLm9uKCdsaW5lcy1zdGRvdXQnLCAobmV3TGluZXMpID0+IHtcbiAgICAgIGxpbmVzID0gbGluZXMuY29uY2F0KG5ld0xpbmVzKTtcbiAgICB9KTtcbiAgICBhd2FpdCBzdWJwcm9jLnN0YXJ0KDApO1xuICAgIGF3YWl0IEIuZGVsYXkoNTApO1xuICAgIGxpbmVzLnNob3VsZC5pbmNsdWRlKCdiYWRfZXhpdC5zaCcpO1xuICAgIGxpbmVzLnNob3VsZC5jb250YWluKCdiaWdidWZmZXIuanMnKTtcbiAgICBsaW5lcy5zaG91bGQuY29udGFpbignZWNoby5zaCcpO1xuICB9KTtcblxuICBkZXNjcmliZSgnI3N0YXJ0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgY29tbWFuZCBmYWlscyBvbiBzdGFydHVwJywgYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IHMgPSBuZXcgU3ViUHJvY2VzcygnYmxhcmdpbWFyZycpO1xuICAgICAgYXdhaXQgcy5zdGFydCgpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvbm90IGZvdW5kLyk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBoYXZlIGEgZGVmYXVsdCBzdGFydERldGVjdG9yIG9mIHdhaXRpbmcgZm9yIG91dHB1dCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBoYXNEYXRhID0gZmFsc2U7XG4gICAgICBsZXQgcyA9IG5ldyBTdWJQcm9jZXNzKCdscycpO1xuICAgICAgcy5vbignb3V0cHV0JywgKHN0ZG91dCkgPT4ge1xuICAgICAgICBpZiAoc3Rkb3V0KSB7XG4gICAgICAgICAgaGFzRGF0YSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYXdhaXQgcy5zdGFydCgpO1xuICAgICAgaGFzRGF0YS5zaG91bGQuYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGludGVycHJldCBhIG51bWVyaWMgc3RhcnREZXRlY3RvciBhcyBhIHN0YXJ0IHRpbWVvdXQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBsZXQgaGFzRGF0YSA9IGZhbHNlO1xuICAgICAgbGV0IHMgPSBuZXcgU3ViUHJvY2VzcyhnZXRGaXh0dXJlKCdzbGVlcHlwcm9jJyksIFsnbHMnXSk7XG4gICAgICBzLm9uKCdvdXRwdXQnLCAoc3Rkb3V0KSA9PiB7XG4gICAgICAgIGlmIChzdGRvdXQpIHtcbiAgICAgICAgICBoYXNEYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBhd2FpdCBzLnN0YXJ0KDApO1xuICAgICAgaGFzRGF0YS5zaG91bGQuYmUuZmFsc2U7XG4gICAgICBhd2FpdCBCLmRlbGF5KDEyMDApO1xuICAgICAgaGFzRGF0YS5zaG91bGQuYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGZhaWwgZXZlbiB3aXRoIGEgc3RhcnQgdGltZW91dCBvZiAwIHdoZW4gY29tbWFuZCBpcyBiYWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBsZXQgcyA9IG5ldyBTdWJQcm9jZXNzKCdibGFyZ2ltYXJnJyk7XG4gICAgICBhd2FpdCBzLnN0YXJ0KDApLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvbm90IGZvdW5kLyk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIHByb3ZpZGUgYSBjdXN0b20gc3RhcnREZXRlY3RvciBmdW5jdGlvbicsIGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBzZCA9IChzdGRvdXQpID0+IHsgcmV0dXJuIHN0ZG91dDsgfTtcbiAgICAgIGxldCBoYXNEYXRhID0gZmFsc2U7XG4gICAgICBsZXQgcyA9IG5ldyBTdWJQcm9jZXNzKCdscycpO1xuICAgICAgcy5vbignb3V0cHV0JywgKHN0ZG91dCkgPT4ge1xuICAgICAgICBpZiAoc3Rkb3V0KSB7XG4gICAgICAgICAgaGFzRGF0YSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYXdhaXQgcy5zdGFydChzZCk7XG4gICAgICBoYXNEYXRhLnNob3VsZC5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcGFzcyBvbiBjdXN0b20gZXJyb3JzIGZyb20gc3RhcnREZXRlY3RvcicsIGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBzZCA9ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKCdmb28nKTsgfTtcbiAgICAgIGxldCBzID0gbmV3IFN1YlByb2Nlc3MoJ2xzJyk7XG4gICAgICBhd2FpdCBzLnN0YXJ0KHNkKS5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL2Zvby8pO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgdGltZSBvdXQgc3RhcnRzIHRoYXQgdGFrZSBsb25nZXIgdGhhbiBzcGVjaWZpZWQgbXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBsZXQgc2QgPSAoc3Rkb3V0KSA9PiB7IHJldHVybiBzdGRvdXQuaW5kZXhPZignbm90aGVyZScpICE9PSAtMTsgfTtcbiAgICAgIGxldCBzID0gbmV3IFN1YlByb2Nlc3MoJ2xzJyk7XG4gICAgICBsZXQgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgYXdhaXQgcy5zdGFydChzZCwgNTAwKS5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL2RpZCBub3Qgc3RhcnQuK3RpbWUvaSk7XG4gICAgICAoRGF0ZS5ub3coKSAtIHN0YXJ0KS5zaG91bGQuYmUuYmVsb3coNjAwKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2xpc3RlbmluZyBmb3IgZGF0YScsICgpID0+IHtcbiAgICBsZXQgc3VicHJvYztcbiAgICBhZnRlckVhY2goYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3VicHJvYy5zdG9wKCk7XG4gICAgICB9IGNhdGNoIChpZ24pIHt9XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBnZXQgb3V0cHV0IGFzIHBhcmFtcycsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGF3YWl0IG5ldyBCKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgc3VicHJvYyA9IG5ldyBTdWJQcm9jZXNzKGdldEZpeHR1cmUoJ3NsZWVweXByb2MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsnbHMnLCBwYXRoLnJlc29sdmUoX19kaXJuYW1lKV0pO1xuICAgICAgICBzdWJwcm9jLm9uKCdvdXRwdXQnLCAoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgaWYgKHN0ZG91dCAmJiBzdGRvdXQuaW5kZXhPZignc3VicHJvYy1zcGVjcycpID09PSAtMSkge1xuICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdWJwcm9jLnN0YXJ0KCk7XG4gICAgICB9KS5zaG91bGQuZXZlbnR1YWxseS5ub3QuYmUucmVqZWN0ZWQ7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBnZXQgb3V0cHV0IGFzIHBhcmFtcycsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGF3YWl0IG5ldyBCKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgc3VicHJvYyA9IG5ldyBTdWJQcm9jZXNzKGdldEZpeHR1cmUoJ2VjaG8nKSwgWydmb28nLCAnYmFyJ10pO1xuICAgICAgICBzdWJwcm9jLm9uKCdvdXRwdXQnLCAoc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgICBpZiAoc3RkZXJyICYmIHN0ZGVyci5pbmRleE9mKCdiYXInKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgc3VicHJvYy5zdGFydCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGdldCBvdXRwdXQgYnkgbGluZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICBzdWJwcm9jID0gbmV3IFN1YlByb2Nlc3MoJ2xzJywgW3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUpXSk7XG4gICAgICBsZXQgbGluZXMgPSBbXTtcbiAgICAgIHN1YnByb2Mub24oJ2xpbmVzLXN0ZG91dCcsIChuZXdMaW5lcykgPT4ge1xuICAgICAgICBsaW5lcyA9IGxpbmVzLmNvbmNhdChuZXdMaW5lcyk7XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IHN1YnByb2Muc3RhcnQoMCk7XG4gICAgICBhd2FpdCBCLmRlbGF5KDUwKTtcbiAgICAgIGxpbmVzLnNob3VsZC5lcWwoWydleGVjLXNwZWNzLmpzJywgJ2ZpeHR1cmVzJywgJ2hlbHBlcnMuanMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N1YnByb2Mtc3BlY3MuanMnXSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCcjc3RvcCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHNlbmQgdGhlIHJpZ2h0IHNpZ25hbCB0byBzdG9wIGEgcHJvYycsIGFzeW5jICgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgQihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBzdWJwcm9jID0gbmV3IFN1YlByb2Nlc3MoJ3RhaWwnLCBbJy1mJywgcGF0aC5yZXNvbHZlKF9fZmlsZW5hbWUpXSk7XG4gICAgICAgIGF3YWl0IHN1YnByb2Muc3RhcnQoKTtcbiAgICAgICAgc3VicHJvYy5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2lnbmFsLnNob3VsZC5lcXVhbChzdG9wU2lnbmFsKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgc3VicHJvYy5zdG9wKHN0b3BTaWduYWwpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHRpbWUgb3V0IGlmIHN0b3AgZG9lc250IGNvbXBsZXRlIGZhc3QgZW5vdWdoJywgYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IHN1YnByb2MgPSBuZXcgU3ViUHJvY2VzcyhnZXRGaXh0dXJlKCd0cmFwaHVwJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsndGFpbCcsICctZicsIHBhdGgucmVzb2x2ZShfX2ZpbGVuYW1lKV0pO1xuICAgICAgYXdhaXQgc3VicHJvYy5zdGFydCgpO1xuICAgICAgYXdhaXQgc3VicHJvYy5zdG9wKHN0b3BTaWduYWwsIDEpXG4gICAgICAgICAgICAgIC5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL1Byb2Nlc3MgZGlkbid0IGVuZC8pO1xuXG4gICAgICAvLyBuZWVkIHRvIGtpbGwgdGhlIHByb2Nlc3NcbiAgICAgIC8vIDEgZm9yIHRoZSB0cmFwLCAxIGZvciB0aGUgdGFpbFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZXhlYygna2lsbCcsIFsnLTknLCBzdWJwcm9jLnByb2MucGlkICsgMV0pO1xuICAgICAgfSBjYXRjaCAoaWduKSB7fVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZXhlYygna2lsbCcsIFsnLTknLCBzdWJwcm9jLnByb2MucGlkXSk7XG4gICAgICB9IGNhdGNoIChpZ24pIHt9XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGVycm9yIGlmIHRoZXJlIGlzIG5vIHByb2Nlc3MgdG8gc3RvcCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBzdWJwcm9jID0gbmV3IFN1YlByb2Nlc3MoJ2xzJyk7XG4gICAgICBhd2FpdCBzdWJwcm9jLnN0b3AoKS5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL0Nhbid0IHN0b3AvKTtcbiAgICAgIGF3YWl0IHN1YnByb2Muc3RhcnQoKTtcbiAgICAgIGF3YWl0IEIuZGVsYXkoMTApO1xuICAgICAgYXdhaXQgc3VicHJvYy5zdG9wKCkuc2hvdWxkLmV2ZW50dWFsbHkuYmUucmVqZWN0ZWRXaXRoKC9DYW4ndCBzdG9wLyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCcjam9pbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGZhaWwgaWYgdGhlICNzdGFydCBoYXMgbm90IHlldCBiZWVuIGNhbGxlZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHByb2MgPSBuZXcgU3ViUHJvY2VzcyhnZXRGaXh0dXJlKCdzbGVlcHlwcm9jLnNoJyksIFsnbHMnXSk7XG4gICAgICBhd2FpdCBwcm9jLmpvaW4oKS5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL0Nhbid0IGpvaW4vKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgd2FpdCB1bnRpbCB0aGUgcHJvY2VzcyBoYXMgYmVlbiBmaW5pc2hlZCcsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHByb2MgPSBuZXcgU3ViUHJvY2VzcyhnZXRGaXh0dXJlKCdzbGVlcHlwcm9jJyksIFsnbHMnXSk7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgYXdhaXQgcHJvYy5zdGFydCgwKTtcbiAgICAgIGF3YWl0IHByb2Muam9pbigpO1xuICAgICAgY29uc3QgZGlmZiA9IERhdGUubm93KCkgLSBub3c7XG4gICAgICBkaWZmLnNob3VsZC5iZS5hYm92ZSgxMDAwKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgdGhyb3cgaWYgcHJvY2VzcyBlbmRzIHdpdGggYSBpbnZhbGlkIGV4aXRjb2RlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvYyA9IG5ldyBTdWJQcm9jZXNzKGdldEZpeHR1cmUoJ2JhZF9leGl0JykpO1xuICAgICAgYXdhaXQgcHJvYy5zdGFydCgwKTtcbiAgICAgIGF3YWl0IHByb2Muam9pbigpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvUHJvY2VzcyBlbmRlZCB3aXRoIGV4aXRjb2RlLyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIE5PVCB0aHJvdyBpZiBwcm9jZXNzIGVuZHMgd2l0aCBhIGN1c3RvbSBhbGxvd2VkIGV4aXRjb2RlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvYyA9IG5ldyBTdWJQcm9jZXNzKGdldEZpeHR1cmUoJ2JhZF9leGl0JykpO1xuICAgICAgYXdhaXQgcHJvYy5zdGFydCgwKTtcbiAgICAgIGF3YWl0IHByb2Muam9pbihbMV0pLnNob3VsZC5ldmVudHVhbGx5LmJlLmJlY29tZSgxKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4ifQ==
