require('source-map-support').install();

'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _this = this;

var _libAppium = require('../lib/appium');

var _appiumFakeDriver = require('appium-fake-driver');

var _helpers = require('./helpers');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _appiumXcuitestDriver = require('appium-xcuitest-driver');

var _appiumIosDriver = require('appium-ios-driver');

var _asyncbox = require('asyncbox');

_chai2['default'].should();
_chai2['default'].use(_chaiAsPromised2['default']);

var BASE_CAPS = { platformName: 'Fake', deviceName: 'Fake', app: _helpers.TEST_FAKE_APP };
var SESSION_ID = 1;

describe('AppiumDriver', function () {
  describe('getAppiumRouter', function () {
    it('should return a route configuring function', function callee$2$0() {
      var routeConfiguringFunction;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            routeConfiguringFunction = (0, _libAppium.getAppiumRouter)({});

            routeConfiguringFunction.should.be.a['function'];

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });

  describe('AppiumDriver', function () {
    function getDriverAndFakeDriver() {
      var appium = new _libAppium.AppiumDriver({});
      var fakeDriver = new _appiumFakeDriver.FakeDriver();
      var mockFakeDriver = _sinon2['default'].mock(fakeDriver);
      appium.getDriverForCaps = function () /*args*/{
        return function () {
          return fakeDriver;
        };
      };
      return [appium, mockFakeDriver];
    }
    describe('createSession', function () {
      var appium = undefined;
      var mockFakeDriver = undefined;
      beforeEach(function () {
        var _getDriverAndFakeDriver = getDriverAndFakeDriver();

        var _getDriverAndFakeDriver2 = _slicedToArray(_getDriverAndFakeDriver, 2);

        appium = _getDriverAndFakeDriver2[0];
        mockFakeDriver = _getDriverAndFakeDriver2[1];
      });
      afterEach(function callee$3$0() {
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              mockFakeDriver.restore();
              context$4$0.next = 3;
              return _regeneratorRuntime.awrap(appium.deleteSession(SESSION_ID));

            case 3:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });

      it('should call inner driver\'s createSession with desired capabilities', function callee$3$0() {
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              mockFakeDriver.expects("createSession").once().withExactArgs(BASE_CAPS, undefined, []).returns([SESSION_ID, BASE_CAPS]);
              context$4$0.next = 3;
              return _regeneratorRuntime.awrap(appium.createSession(BASE_CAPS));

            case 3:
              mockFakeDriver.verify();

            case 4:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should call inner driver\'s createSession with desired and default capabilities', function callee$3$0() {
        var defaultCaps, allCaps;
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              defaultCaps = { deviceName: 'Emulator' }, allCaps = _lodash2['default'].extend(_lodash2['default'].clone(defaultCaps), BASE_CAPS);

              appium.args.defaultCapabilities = defaultCaps;
              mockFakeDriver.expects("createSession").once().withArgs(allCaps).returns([SESSION_ID, allCaps]);
              context$4$0.next = 5;
              return _regeneratorRuntime.awrap(appium.createSession(BASE_CAPS));

            case 5:
              mockFakeDriver.verify();

            case 6:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should call inner driver\'s createSession with desired and default capabilities without overriding caps', function callee$3$0() {
        var defaultCaps;
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              defaultCaps = { platformName: 'Ersatz' };

              appium.args.defaultCapabilities = defaultCaps;
              mockFakeDriver.expects("createSession").once().withArgs(BASE_CAPS).returns([SESSION_ID, BASE_CAPS]);
              context$4$0.next = 5;
              return _regeneratorRuntime.awrap(appium.createSession(BASE_CAPS));

            case 5:
              mockFakeDriver.verify();

            case 6:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should kill all other sessions if sessionOverride is on', function callee$3$0() {
        var fakeDrivers, mockFakeDrivers, sessions, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, mfd;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              appium.args.sessionOverride = true;

              // mock three sessions that should be removed when the new one is created
              fakeDrivers = [new _appiumFakeDriver.FakeDriver(), new _appiumFakeDriver.FakeDriver(), new _appiumFakeDriver.FakeDriver()];
              mockFakeDrivers = _lodash2['default'].map(fakeDrivers, function (fd) {
                return _sinon2['default'].mock(fd);
              });

              mockFakeDrivers[0].expects('deleteSession').once();
              mockFakeDrivers[1].expects('deleteSession').once().throws('Cannot shut down Android driver; it has already shut down');
              mockFakeDrivers[2].expects('deleteSession').once();
              appium.sessions['abc-123-xyz'] = fakeDrivers[0];
              appium.sessions['xyz-321-abc'] = fakeDrivers[1];
              appium.sessions['123-abc-xyz'] = fakeDrivers[2];

              context$4$0.next = 11;
              return _regeneratorRuntime.awrap(appium.getSessions());

            case 11:
              sessions = context$4$0.sent;

              sessions.should.have.length(3);

              mockFakeDriver.expects("createSession").once().withExactArgs(BASE_CAPS, undefined, []).returns([SESSION_ID, BASE_CAPS]);
              context$4$0.next = 16;
              return _regeneratorRuntime.awrap(appium.createSession(BASE_CAPS));

            case 16:
              context$4$0.next = 18;
              return _regeneratorRuntime.awrap(appium.getSessions());

            case 18:
              sessions = context$4$0.sent;

              sessions.should.have.length(1);

              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              context$4$0.prev = 23;
              for (_iterator = _getIterator(mockFakeDrivers); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                mfd = _step.value;

                mfd.verify();
              }
              context$4$0.next = 31;
              break;

            case 27:
              context$4$0.prev = 27;
              context$4$0.t0 = context$4$0['catch'](23);
              _didIteratorError = true;
              _iteratorError = context$4$0.t0;

            case 31:
              context$4$0.prev = 31;
              context$4$0.prev = 32;

              if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
              }

            case 34:
              context$4$0.prev = 34;

              if (!_didIteratorError) {
                context$4$0.next = 37;
                break;
              }

              throw _iteratorError;

            case 37:
              return context$4$0.finish(34);

            case 38:
              return context$4$0.finish(31);

            case 39:
              mockFakeDriver.verify();

            case 40:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this, [[23, 27, 31, 39], [32,, 34, 38]]);
      });
    });
    describe('deleteSession', function () {
      var appium = undefined;
      var mockFakeDriver = undefined;
      beforeEach(function () {
        var _getDriverAndFakeDriver3 = getDriverAndFakeDriver();

        var _getDriverAndFakeDriver32 = _slicedToArray(_getDriverAndFakeDriver3, 2);

        appium = _getDriverAndFakeDriver32[0];
        mockFakeDriver = _getDriverAndFakeDriver32[1];
      });
      afterEach(function () {
        mockFakeDriver.restore();
      });
      it('should remove the session if it is found', function callee$3$0() {
        var _ref, _ref2, sessionId, sessions;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.createSession(BASE_CAPS));

            case 2:
              _ref = context$4$0.sent;
              _ref2 = _slicedToArray(_ref, 1);
              sessionId = _ref2[0];
              context$4$0.next = 7;
              return _regeneratorRuntime.awrap(appium.getSessions());

            case 7:
              sessions = context$4$0.sent;

              sessions.should.have.length(1);
              context$4$0.next = 11;
              return _regeneratorRuntime.awrap(appium.deleteSession(sessionId));

            case 11:
              context$4$0.next = 13;
              return _regeneratorRuntime.awrap(appium.getSessions());

            case 13:
              sessions = context$4$0.sent;

              sessions.should.have.length(0);

            case 15:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should call inner driver\'s deleteSession method', function callee$3$0() {
        var _ref3, _ref32, sessionId;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.createSession(BASE_CAPS));

            case 2:
              _ref3 = context$4$0.sent;
              _ref32 = _slicedToArray(_ref3, 1);
              sessionId = _ref32[0];

              mockFakeDriver.expects("deleteSession").once().withExactArgs(sessionId, []).returns();
              context$4$0.next = 8;
              return _regeneratorRuntime.awrap(appium.deleteSession(sessionId));

            case 8:
              mockFakeDriver.verify();

              // cleanup, since we faked the delete session call
              context$4$0.next = 11;
              return _regeneratorRuntime.awrap(mockFakeDriver.object.deleteSession());

            case 11:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
    });
    describe('getSessions', function () {
      var appium = undefined;
      var sessions = undefined;
      before(function () {
        appium = new _libAppium.AppiumDriver({});
      });
      afterEach(function callee$3$0() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, session;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              context$4$0.prev = 3;
              _iterator2 = _getIterator(sessions);

            case 5:
              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                context$4$0.next = 12;
                break;
              }

              session = _step2.value;
              context$4$0.next = 9;
              return _regeneratorRuntime.awrap(appium.deleteSession(session.id));

            case 9:
              _iteratorNormalCompletion2 = true;
              context$4$0.next = 5;
              break;

            case 12:
              context$4$0.next = 18;
              break;

            case 14:
              context$4$0.prev = 14;
              context$4$0.t0 = context$4$0['catch'](3);
              _didIteratorError2 = true;
              _iteratorError2 = context$4$0.t0;

            case 18:
              context$4$0.prev = 18;
              context$4$0.prev = 19;

              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }

            case 21:
              context$4$0.prev = 21;

              if (!_didIteratorError2) {
                context$4$0.next = 24;
                break;
              }

              throw _iteratorError2;

            case 24:
              return context$4$0.finish(21);

            case 25:
              return context$4$0.finish(18);

            case 26:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this, [[3, 14, 18, 26], [19,, 21, 25]]);
      });
      it('should return an empty array of sessions', function callee$3$0() {
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.getSessions());

            case 2:
              sessions = context$4$0.sent;

              sessions.should.be.an.array;
              sessions.should.be.empty;

            case 5:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should return sessions created', function callee$3$0() {
        var session1, session2;
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.createSession(_lodash2['default'].extend(_lodash2['default'].clone(BASE_CAPS), { cap: 'value' })));

            case 2:
              session1 = context$4$0.sent;
              context$4$0.next = 5;
              return _regeneratorRuntime.awrap(appium.createSession(_lodash2['default'].extend(_lodash2['default'].clone(BASE_CAPS), { cap: 'other value' })));

            case 5:
              session2 = context$4$0.sent;
              context$4$0.next = 8;
              return _regeneratorRuntime.awrap(appium.getSessions());

            case 8:
              sessions = context$4$0.sent;

              sessions.should.be.an.array;
              sessions.should.have.length(2);
              sessions[0].id.should.equal(session1[0]);
              sessions[0].capabilities.should.eql(session1[1]);
              sessions[1].id.should.equal(session2[0]);
              sessions[1].capabilities.should.eql(session2[1]);

            case 15:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
    });
    describe('getStatus', function () {
      var appium = undefined;
      before(function () {
        appium = new _libAppium.AppiumDriver({});
      });
      it('should return a status', function callee$3$0() {
        var status;
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.getStatus());

            case 2:
              status = context$4$0.sent;

              status.build.should.exist;
              status.build.version.should.exist;

            case 5:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
    });
    describe('sessionExists', function () {});
    describe('attachUnexpectedShutdownHandler', function () {
      var appium = undefined,
          mockFakeDriver = undefined;
      beforeEach(function () {
        var _getDriverAndFakeDriver4 = getDriverAndFakeDriver();

        var _getDriverAndFakeDriver42 = _slicedToArray(_getDriverAndFakeDriver4, 2);

        appium = _getDriverAndFakeDriver42[0];
        mockFakeDriver = _getDriverAndFakeDriver42[1];
      });
      afterEach(function callee$3$0() {
        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(mockFakeDriver.object.deleteSession());

            case 2:
              mockFakeDriver.restore();
              appium.args.defaultCapabilities = {};

            case 4:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });

      it('should remove session if inner driver unexpectedly exits with an error', function callee$3$0() {
        var _ref4, _ref42, sessionId;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.createSession(_lodash2['default'].clone(BASE_CAPS)));

            case 2:
              _ref4 = context$4$0.sent;
              _ref42 = _slicedToArray(_ref4, 1);
              sessionId = _ref42[0];
              // eslint-disable-line comma-spacing
              _lodash2['default'].keys(appium.sessions).should.contain(sessionId);
              appium.sessions[sessionId].unexpectedShutdownDeferred.reject(new Error("Oops"));
              // let event loop spin so rejection is handled
              context$4$0.next = 9;
              return _regeneratorRuntime.awrap((0, _asyncbox.sleep)(1));

            case 9:
              _lodash2['default'].keys(appium.sessions).should.not.contain(sessionId);

            case 10:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should remove session if inner driver unexpectedly exits with no error', function callee$3$0() {
        var _ref5, _ref52, sessionId;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.createSession(_lodash2['default'].clone(BASE_CAPS)));

            case 2:
              _ref5 = context$4$0.sent;
              _ref52 = _slicedToArray(_ref5, 1);
              sessionId = _ref52[0];
              // eslint-disable-line comma-spacing
              _lodash2['default'].keys(appium.sessions).should.contain(sessionId);
              appium.sessions[sessionId].unexpectedShutdownDeferred.resolve();
              // let event loop spin so rejection is handled
              context$4$0.next = 9;
              return _regeneratorRuntime.awrap((0, _asyncbox.sleep)(1));

            case 9:
              _lodash2['default'].keys(appium.sessions).should.not.contain(sessionId);

            case 10:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
      it('should not remove session if inner driver cancels unexpected exit', function callee$3$0() {
        var _ref6, _ref62, sessionId;

        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
          while (1) switch (context$4$0.prev = context$4$0.next) {
            case 0:
              context$4$0.next = 2;
              return _regeneratorRuntime.awrap(appium.createSession(_lodash2['default'].clone(BASE_CAPS)));

            case 2:
              _ref6 = context$4$0.sent;
              _ref62 = _slicedToArray(_ref6, 1);
              sessionId = _ref62[0];
              // eslint-disable-line comma-spacing
              _lodash2['default'].keys(appium.sessions).should.contain(sessionId);
              appium.sessions[sessionId].onUnexpectedShutdown.cancel();
              // let event loop spin so rejection is handled
              context$4$0.next = 9;
              return _regeneratorRuntime.awrap((0, _asyncbox.sleep)(1));

            case 9:
              _lodash2['default'].keys(appium.sessions).should.contain(sessionId);

            case 10:
            case 'end':
              return context$4$0.stop();
          }
        }, null, _this);
      });
    });
    describe('getDriverForCaps', function () {
      it('should not blow up if user does not provide platformName', function () {
        var appium = new _libAppium.AppiumDriver({});
        (function () {
          appium.getDriverForCaps({});
        }).should['throw'](/platformName/);
      });
      it('should get XCUITestDriver driver for automationName of XCUITest', function () {
        var appium = new _libAppium.AppiumDriver({});
        var driver = appium.getDriverForCaps({
          platformName: 'iOS',
          automationName: 'XCUITest'
        });
        driver.should.be.an['instanceof'](Function);
        driver.should.equal(_appiumXcuitestDriver.XCUITestDriver);
      });
      it('should get iosdriver for ios < 10', function () {
        var appium = new _libAppium.AppiumDriver({});
        var caps = {
          platformName: 'iOS',
          platformVersion: '8.0'
        };
        var driver = appium.getDriverForCaps(caps);
        driver.should.be.an['instanceof'](Function);
        driver.should.equal(_appiumIosDriver.IosDriver);

        caps.platformVersion = '8.1';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumIosDriver.IosDriver);

        caps.platformVersion = '9.4';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumIosDriver.IosDriver);

        caps.platformVersion = '';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumIosDriver.IosDriver);

        caps.platformVersion = 'foo';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumIosDriver.IosDriver);

        delete caps.platformVersion;
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumIosDriver.IosDriver);
      });
      it('should get xcuitestdriver for ios >= 10', function () {
        var appium = new _libAppium.AppiumDriver({});
        var caps = {
          platformName: 'iOS',
          platformVersion: '10'
        };
        var driver = appium.getDriverForCaps(caps);
        driver.should.be.an['instanceof'](Function);
        driver.should.equal(_appiumXcuitestDriver.XCUITestDriver);

        caps.platformVersion = '10.0';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumXcuitestDriver.XCUITestDriver);

        caps.platformVersion = '10.1';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumXcuitestDriver.XCUITestDriver);

        caps.platformVersion = '12.14';
        driver = appium.getDriverForCaps(caps);
        driver.should.equal(_appiumXcuitestDriver.XCUITestDriver);
      });
    });
  });
});

// a default capability with the same key as a desired capability
// should do nothing
//# sourceMappingURL=data:application/json;charset=utf8;base64,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WUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7QUFDOUIsY0FBTSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxjQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssc0NBQWdCLENBQUM7O0FBRXBDLFlBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO0FBQy9CLGNBQU0sR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLHNDQUFnQixDQUFDO09BQ3JDLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJ0ZXN0L2RyaXZlci1zcGVjcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRyYW5zcGlsZTptb2NoYVxuXG5pbXBvcnQgeyBBcHBpdW1Ecml2ZXIsIGdldEFwcGl1bVJvdXRlciB9IGZyb20gJy4uL2xpYi9hcHBpdW0nO1xuaW1wb3J0IHsgRmFrZURyaXZlciB9IGZyb20gJ2FwcGl1bS1mYWtlLWRyaXZlcic7XG5pbXBvcnQgeyBURVNUX0ZBS0VfQVBQIH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgc2lub24gZnJvbSAnc2lub24nO1xuaW1wb3J0IGNoYWkgZnJvbSAnY2hhaSc7XG5pbXBvcnQgY2hhaUFzUHJvbWlzZWQgZnJvbSAnY2hhaS1hcy1wcm9taXNlZCc7XG5pbXBvcnQgeyBYQ1VJVGVzdERyaXZlciB9IGZyb20gJ2FwcGl1bS14Y3VpdGVzdC1kcml2ZXInO1xuaW1wb3J0IHsgSW9zRHJpdmVyIH0gZnJvbSAnYXBwaXVtLWlvcy1kcml2ZXInO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tICdhc3luY2JveCc7XG5cbmNoYWkuc2hvdWxkKCk7XG5jaGFpLnVzZShjaGFpQXNQcm9taXNlZCk7XG5cbmNvbnN0IEJBU0VfQ0FQUyA9IHtwbGF0Zm9ybU5hbWU6ICdGYWtlJywgZGV2aWNlTmFtZTogJ0Zha2UnLCBhcHA6IFRFU1RfRkFLRV9BUFB9O1xuY29uc3QgU0VTU0lPTl9JRCA9IDE7XG5cbmRlc2NyaWJlKCdBcHBpdW1Ecml2ZXInLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdnZXRBcHBpdW1Sb3V0ZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gYSByb3V0ZSBjb25maWd1cmluZyBmdW5jdGlvbicsIGFzeW5jICgpID0+IHtcbiAgICAgIGxldCByb3V0ZUNvbmZpZ3VyaW5nRnVuY3Rpb24gPSBnZXRBcHBpdW1Sb3V0ZXIoe30pO1xuICAgICAgcm91dGVDb25maWd1cmluZ0Z1bmN0aW9uLnNob3VsZC5iZS5hLmZ1bmN0aW9uO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnQXBwaXVtRHJpdmVyJywgKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGdldERyaXZlckFuZEZha2VEcml2ZXIgKCkge1xuICAgICAgbGV0IGFwcGl1bSA9IG5ldyBBcHBpdW1Ecml2ZXIoe30pO1xuICAgICAgbGV0IGZha2VEcml2ZXIgPSBuZXcgRmFrZURyaXZlcigpO1xuICAgICAgbGV0IG1vY2tGYWtlRHJpdmVyID0gc2lub24ubW9jayhmYWtlRHJpdmVyKTtcbiAgICAgIGFwcGl1bS5nZXREcml2ZXJGb3JDYXBzID0gZnVuY3Rpb24gKC8qYXJncyovKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGZha2VEcml2ZXI7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgcmV0dXJuIFthcHBpdW0sIG1vY2tGYWtlRHJpdmVyXTtcbiAgICB9XG4gICAgZGVzY3JpYmUoJ2NyZWF0ZVNlc3Npb24nLCAoKSA9PiB7XG4gICAgICBsZXQgYXBwaXVtO1xuICAgICAgbGV0IG1vY2tGYWtlRHJpdmVyO1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIFthcHBpdW0sIG1vY2tGYWtlRHJpdmVyXSA9IGdldERyaXZlckFuZEZha2VEcml2ZXIoKTtcbiAgICAgIH0pO1xuICAgICAgYWZ0ZXJFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgbW9ja0Zha2VEcml2ZXIucmVzdG9yZSgpO1xuICAgICAgICBhd2FpdCBhcHBpdW0uZGVsZXRlU2Vzc2lvbihTRVNTSU9OX0lEKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIGNhbGwgaW5uZXIgZHJpdmVyXFwncyBjcmVhdGVTZXNzaW9uIHdpdGggZGVzaXJlZCBjYXBhYmlsaXRpZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLmV4cGVjdHMoXCJjcmVhdGVTZXNzaW9uXCIpXG4gICAgICAgICAgLm9uY2UoKS53aXRoRXhhY3RBcmdzKEJBU0VfQ0FQUywgdW5kZWZpbmVkLCBbXSlcbiAgICAgICAgICAucmV0dXJucyhbU0VTU0lPTl9JRCwgQkFTRV9DQVBTXSk7XG4gICAgICAgIGF3YWl0IGFwcGl1bS5jcmVhdGVTZXNzaW9uKEJBU0VfQ0FQUyk7XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLnZlcmlmeSgpO1xuICAgICAgfSk7XG4gICAgICBpdCgnc2hvdWxkIGNhbGwgaW5uZXIgZHJpdmVyXFwncyBjcmVhdGVTZXNzaW9uIHdpdGggZGVzaXJlZCBhbmQgZGVmYXVsdCBjYXBhYmlsaXRpZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCBkZWZhdWx0Q2FwcyA9IHtkZXZpY2VOYW1lOiAnRW11bGF0b3InfVxuICAgICAgICAgICwgYWxsQ2FwcyA9IF8uZXh0ZW5kKF8uY2xvbmUoZGVmYXVsdENhcHMpLCBCQVNFX0NBUFMpO1xuICAgICAgICBhcHBpdW0uYXJncy5kZWZhdWx0Q2FwYWJpbGl0aWVzID0gZGVmYXVsdENhcHM7XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLmV4cGVjdHMoXCJjcmVhdGVTZXNzaW9uXCIpXG4gICAgICAgICAgLm9uY2UoKS53aXRoQXJncyhhbGxDYXBzKVxuICAgICAgICAgIC5yZXR1cm5zKFtTRVNTSU9OX0lELCBhbGxDYXBzXSk7XG4gICAgICAgIGF3YWl0IGFwcGl1bS5jcmVhdGVTZXNzaW9uKEJBU0VfQ0FQUyk7XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLnZlcmlmeSgpO1xuICAgICAgfSk7XG4gICAgICBpdCgnc2hvdWxkIGNhbGwgaW5uZXIgZHJpdmVyXFwncyBjcmVhdGVTZXNzaW9uIHdpdGggZGVzaXJlZCBhbmQgZGVmYXVsdCBjYXBhYmlsaXRpZXMgd2l0aG91dCBvdmVycmlkaW5nIGNhcHMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIGEgZGVmYXVsdCBjYXBhYmlsaXR5IHdpdGggdGhlIHNhbWUga2V5IGFzIGEgZGVzaXJlZCBjYXBhYmlsaXR5XG4gICAgICAgIC8vIHNob3VsZCBkbyBub3RoaW5nXG4gICAgICAgIGxldCBkZWZhdWx0Q2FwcyA9IHtwbGF0Zm9ybU5hbWU6ICdFcnNhdHonfTtcbiAgICAgICAgYXBwaXVtLmFyZ3MuZGVmYXVsdENhcGFiaWxpdGllcyA9IGRlZmF1bHRDYXBzO1xuICAgICAgICBtb2NrRmFrZURyaXZlci5leHBlY3RzKFwiY3JlYXRlU2Vzc2lvblwiKVxuICAgICAgICAgIC5vbmNlKCkud2l0aEFyZ3MoQkFTRV9DQVBTKVxuICAgICAgICAgIC5yZXR1cm5zKFtTRVNTSU9OX0lELCBCQVNFX0NBUFNdKTtcbiAgICAgICAgYXdhaXQgYXBwaXVtLmNyZWF0ZVNlc3Npb24oQkFTRV9DQVBTKTtcbiAgICAgICAgbW9ja0Zha2VEcml2ZXIudmVyaWZ5KCk7XG4gICAgICB9KTtcbiAgICAgIGl0KCdzaG91bGQga2lsbCBhbGwgb3RoZXIgc2Vzc2lvbnMgaWYgc2Vzc2lvbk92ZXJyaWRlIGlzIG9uJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhcHBpdW0uYXJncy5zZXNzaW9uT3ZlcnJpZGUgPSB0cnVlO1xuXG4gICAgICAgIC8vIG1vY2sgdGhyZWUgc2Vzc2lvbnMgdGhhdCBzaG91bGQgYmUgcmVtb3ZlZCB3aGVuIHRoZSBuZXcgb25lIGlzIGNyZWF0ZWRcbiAgICAgICAgbGV0IGZha2VEcml2ZXJzID0gW25ldyBGYWtlRHJpdmVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRmFrZURyaXZlcigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZha2VEcml2ZXIoKV07XG4gICAgICAgIGxldCBtb2NrRmFrZURyaXZlcnMgPSBfLm1hcChmYWtlRHJpdmVycywgKGZkKSA9PiB7cmV0dXJuIHNpbm9uLm1vY2soZmQpO30pO1xuICAgICAgICBtb2NrRmFrZURyaXZlcnNbMF0uZXhwZWN0cygnZGVsZXRlU2Vzc2lvbicpXG4gICAgICAgICAgLm9uY2UoKTtcbiAgICAgICAgbW9ja0Zha2VEcml2ZXJzWzFdLmV4cGVjdHMoJ2RlbGV0ZVNlc3Npb24nKVxuICAgICAgICAgIC5vbmNlKClcbiAgICAgICAgICAudGhyb3dzKCdDYW5ub3Qgc2h1dCBkb3duIEFuZHJvaWQgZHJpdmVyOyBpdCBoYXMgYWxyZWFkeSBzaHV0IGRvd24nKTtcbiAgICAgICAgbW9ja0Zha2VEcml2ZXJzWzJdLmV4cGVjdHMoJ2RlbGV0ZVNlc3Npb24nKVxuICAgICAgICAgIC5vbmNlKCk7XG4gICAgICAgIGFwcGl1bS5zZXNzaW9uc1snYWJjLTEyMy14eXonXSA9IGZha2VEcml2ZXJzWzBdO1xuICAgICAgICBhcHBpdW0uc2Vzc2lvbnNbJ3h5ei0zMjEtYWJjJ10gPSBmYWtlRHJpdmVyc1sxXTtcbiAgICAgICAgYXBwaXVtLnNlc3Npb25zWycxMjMtYWJjLXh5eiddID0gZmFrZURyaXZlcnNbMl07XG5cbiAgICAgICAgbGV0IHNlc3Npb25zID0gYXdhaXQgYXBwaXVtLmdldFNlc3Npb25zKCk7XG4gICAgICAgIHNlc3Npb25zLnNob3VsZC5oYXZlLmxlbmd0aCgzKTtcblxuICAgICAgICBtb2NrRmFrZURyaXZlci5leHBlY3RzKFwiY3JlYXRlU2Vzc2lvblwiKVxuICAgICAgICAgIC5vbmNlKCkud2l0aEV4YWN0QXJncyhCQVNFX0NBUFMsIHVuZGVmaW5lZCwgW10pXG4gICAgICAgICAgLnJldHVybnMoW1NFU1NJT05fSUQsIEJBU0VfQ0FQU10pO1xuICAgICAgICBhd2FpdCBhcHBpdW0uY3JlYXRlU2Vzc2lvbihCQVNFX0NBUFMpO1xuXG4gICAgICAgIHNlc3Npb25zID0gYXdhaXQgYXBwaXVtLmdldFNlc3Npb25zKCk7XG4gICAgICAgIHNlc3Npb25zLnNob3VsZC5oYXZlLmxlbmd0aCgxKTtcblxuICAgICAgICBmb3IgKGxldCBtZmQgb2YgbW9ja0Zha2VEcml2ZXJzKSB7XG4gICAgICAgICAgbWZkLnZlcmlmeSgpO1xuICAgICAgICB9XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLnZlcmlmeSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ2RlbGV0ZVNlc3Npb24nLCAoKSA9PiB7XG4gICAgICBsZXQgYXBwaXVtO1xuICAgICAgbGV0IG1vY2tGYWtlRHJpdmVyO1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIFthcHBpdW0sIG1vY2tGYWtlRHJpdmVyXSA9IGdldERyaXZlckFuZEZha2VEcml2ZXIoKTtcbiAgICAgIH0pO1xuICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgbW9ja0Zha2VEcml2ZXIucmVzdG9yZSgpO1xuICAgICAgfSk7XG4gICAgICBpdCgnc2hvdWxkIHJlbW92ZSB0aGUgc2Vzc2lvbiBpZiBpdCBpcyBmb3VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IFtzZXNzaW9uSWRdID0gYXdhaXQgYXBwaXVtLmNyZWF0ZVNlc3Npb24oQkFTRV9DQVBTKTtcbiAgICAgICAgbGV0IHNlc3Npb25zID0gYXdhaXQgYXBwaXVtLmdldFNlc3Npb25zKCk7XG4gICAgICAgIHNlc3Npb25zLnNob3VsZC5oYXZlLmxlbmd0aCgxKTtcbiAgICAgICAgYXdhaXQgYXBwaXVtLmRlbGV0ZVNlc3Npb24oc2Vzc2lvbklkKTtcbiAgICAgICAgc2Vzc2lvbnMgPSBhd2FpdCBhcHBpdW0uZ2V0U2Vzc2lvbnMoKTtcbiAgICAgICAgc2Vzc2lvbnMuc2hvdWxkLmhhdmUubGVuZ3RoKDApO1xuICAgICAgfSk7XG4gICAgICBpdCgnc2hvdWxkIGNhbGwgaW5uZXIgZHJpdmVyXFwncyBkZWxldGVTZXNzaW9uIG1ldGhvZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgW3Nlc3Npb25JZF0gPSBhd2FpdCBhcHBpdW0uY3JlYXRlU2Vzc2lvbihCQVNFX0NBUFMpO1xuICAgICAgICBtb2NrRmFrZURyaXZlci5leHBlY3RzKFwiZGVsZXRlU2Vzc2lvblwiKVxuICAgICAgICAgIC5vbmNlKCkud2l0aEV4YWN0QXJncyhzZXNzaW9uSWQsIFtdKVxuICAgICAgICAgIC5yZXR1cm5zKCk7XG4gICAgICAgIGF3YWl0IGFwcGl1bS5kZWxldGVTZXNzaW9uKHNlc3Npb25JZCk7XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLnZlcmlmeSgpO1xuXG4gICAgICAgIC8vIGNsZWFudXAsIHNpbmNlIHdlIGZha2VkIHRoZSBkZWxldGUgc2Vzc2lvbiBjYWxsXG4gICAgICAgIGF3YWl0IG1vY2tGYWtlRHJpdmVyLm9iamVjdC5kZWxldGVTZXNzaW9uKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnZ2V0U2Vzc2lvbnMnLCAoKSA9PiB7XG4gICAgICBsZXQgYXBwaXVtO1xuICAgICAgbGV0IHNlc3Npb25zO1xuICAgICAgYmVmb3JlKCgpID0+IHtcbiAgICAgICAgYXBwaXVtID0gbmV3IEFwcGl1bURyaXZlcih7fSk7XG4gICAgICB9KTtcbiAgICAgIGFmdGVyRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICAgIGZvciAobGV0IHNlc3Npb24gb2Ygc2Vzc2lvbnMpIHtcbiAgICAgICAgICBhd2FpdCBhcHBpdW0uZGVsZXRlU2Vzc2lvbihzZXNzaW9uLmlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpdCgnc2hvdWxkIHJldHVybiBhbiBlbXB0eSBhcnJheSBvZiBzZXNzaW9ucycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgc2Vzc2lvbnMgPSBhd2FpdCBhcHBpdW0uZ2V0U2Vzc2lvbnMoKTtcbiAgICAgICAgc2Vzc2lvbnMuc2hvdWxkLmJlLmFuLmFycmF5O1xuICAgICAgICBzZXNzaW9ucy5zaG91bGQuYmUuZW1wdHk7XG4gICAgICB9KTtcbiAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHNlc3Npb25zIGNyZWF0ZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCBzZXNzaW9uMSA9IGF3YWl0IGFwcGl1bS5jcmVhdGVTZXNzaW9uKF8uZXh0ZW5kKF8uY2xvbmUoQkFTRV9DQVBTKSwge2NhcDogJ3ZhbHVlJ30pKTtcbiAgICAgICAgbGV0IHNlc3Npb24yID0gYXdhaXQgYXBwaXVtLmNyZWF0ZVNlc3Npb24oXy5leHRlbmQoXy5jbG9uZShCQVNFX0NBUFMpLCB7Y2FwOiAnb3RoZXIgdmFsdWUnfSkpO1xuXG4gICAgICAgIHNlc3Npb25zID0gYXdhaXQgYXBwaXVtLmdldFNlc3Npb25zKCk7XG4gICAgICAgIHNlc3Npb25zLnNob3VsZC5iZS5hbi5hcnJheTtcbiAgICAgICAgc2Vzc2lvbnMuc2hvdWxkLmhhdmUubGVuZ3RoKDIpO1xuICAgICAgICBzZXNzaW9uc1swXS5pZC5zaG91bGQuZXF1YWwoc2Vzc2lvbjFbMF0pO1xuICAgICAgICBzZXNzaW9uc1swXS5jYXBhYmlsaXRpZXMuc2hvdWxkLmVxbChzZXNzaW9uMVsxXSk7XG4gICAgICAgIHNlc3Npb25zWzFdLmlkLnNob3VsZC5lcXVhbChzZXNzaW9uMlswXSk7XG4gICAgICAgIHNlc3Npb25zWzFdLmNhcGFiaWxpdGllcy5zaG91bGQuZXFsKHNlc3Npb24yWzFdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdnZXRTdGF0dXMnLCAoKSA9PiB7XG4gICAgICBsZXQgYXBwaXVtO1xuICAgICAgYmVmb3JlKCgpID0+IHtcbiAgICAgICAgYXBwaXVtID0gbmV3IEFwcGl1bURyaXZlcih7fSk7XG4gICAgICB9KTtcbiAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgc3RhdHVzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgc3RhdHVzID0gYXdhaXQgYXBwaXVtLmdldFN0YXR1cygpO1xuICAgICAgICBzdGF0dXMuYnVpbGQuc2hvdWxkLmV4aXN0O1xuICAgICAgICBzdGF0dXMuYnVpbGQudmVyc2lvbi5zaG91bGQuZXhpc3Q7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnc2Vzc2lvbkV4aXN0cycsICgpID0+IHtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnYXR0YWNoVW5leHBlY3RlZFNodXRkb3duSGFuZGxlcicsICgpID0+IHtcbiAgICAgIGxldCBhcHBpdW1cbiAgICAgICAgLCBtb2NrRmFrZURyaXZlcjtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBbYXBwaXVtLCBtb2NrRmFrZURyaXZlcl0gPSBnZXREcml2ZXJBbmRGYWtlRHJpdmVyKCk7XG4gICAgICB9KTtcbiAgICAgIGFmdGVyRWFjaChhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IG1vY2tGYWtlRHJpdmVyLm9iamVjdC5kZWxldGVTZXNzaW9uKCk7XG4gICAgICAgIG1vY2tGYWtlRHJpdmVyLnJlc3RvcmUoKTtcbiAgICAgICAgYXBwaXVtLmFyZ3MuZGVmYXVsdENhcGFiaWxpdGllcyA9IHt9O1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgcmVtb3ZlIHNlc3Npb24gaWYgaW5uZXIgZHJpdmVyIHVuZXhwZWN0ZWRseSBleGl0cyB3aXRoIGFuIGVycm9yJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgW3Nlc3Npb25JZCxdID0gYXdhaXQgYXBwaXVtLmNyZWF0ZVNlc3Npb24oXy5jbG9uZShCQVNFX0NBUFMpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb21tYS1zcGFjaW5nXG4gICAgICAgIF8ua2V5cyhhcHBpdW0uc2Vzc2lvbnMpLnNob3VsZC5jb250YWluKHNlc3Npb25JZCk7XG4gICAgICAgIGFwcGl1bS5zZXNzaW9uc1tzZXNzaW9uSWRdLnVuZXhwZWN0ZWRTaHV0ZG93bkRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoXCJPb3BzXCIpKTtcbiAgICAgICAgLy8gbGV0IGV2ZW50IGxvb3Agc3BpbiBzbyByZWplY3Rpb24gaXMgaGFuZGxlZFxuICAgICAgICBhd2FpdCBzbGVlcCgxKTtcbiAgICAgICAgXy5rZXlzKGFwcGl1bS5zZXNzaW9ucykuc2hvdWxkLm5vdC5jb250YWluKHNlc3Npb25JZCk7XG4gICAgICB9KTtcbiAgICAgIGl0KCdzaG91bGQgcmVtb3ZlIHNlc3Npb24gaWYgaW5uZXIgZHJpdmVyIHVuZXhwZWN0ZWRseSBleGl0cyB3aXRoIG5vIGVycm9yJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgW3Nlc3Npb25JZCxdID0gYXdhaXQgYXBwaXVtLmNyZWF0ZVNlc3Npb24oXy5jbG9uZShCQVNFX0NBUFMpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb21tYS1zcGFjaW5nXG4gICAgICAgIF8ua2V5cyhhcHBpdW0uc2Vzc2lvbnMpLnNob3VsZC5jb250YWluKHNlc3Npb25JZCk7XG4gICAgICAgIGFwcGl1bS5zZXNzaW9uc1tzZXNzaW9uSWRdLnVuZXhwZWN0ZWRTaHV0ZG93bkRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgLy8gbGV0IGV2ZW50IGxvb3Agc3BpbiBzbyByZWplY3Rpb24gaXMgaGFuZGxlZFxuICAgICAgICBhd2FpdCBzbGVlcCgxKTtcbiAgICAgICAgXy5rZXlzKGFwcGl1bS5zZXNzaW9ucykuc2hvdWxkLm5vdC5jb250YWluKHNlc3Npb25JZCk7XG4gICAgICB9KTtcbiAgICAgIGl0KCdzaG91bGQgbm90IHJlbW92ZSBzZXNzaW9uIGlmIGlubmVyIGRyaXZlciBjYW5jZWxzIHVuZXhwZWN0ZWQgZXhpdCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IFtzZXNzaW9uSWQsXSA9IGF3YWl0IGFwcGl1bS5jcmVhdGVTZXNzaW9uKF8uY2xvbmUoQkFTRV9DQVBTKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29tbWEtc3BhY2luZ1xuICAgICAgICBfLmtleXMoYXBwaXVtLnNlc3Npb25zKS5zaG91bGQuY29udGFpbihzZXNzaW9uSWQpO1xuICAgICAgICBhcHBpdW0uc2Vzc2lvbnNbc2Vzc2lvbklkXS5vblVuZXhwZWN0ZWRTaHV0ZG93bi5jYW5jZWwoKTtcbiAgICAgICAgLy8gbGV0IGV2ZW50IGxvb3Agc3BpbiBzbyByZWplY3Rpb24gaXMgaGFuZGxlZFxuICAgICAgICBhd2FpdCBzbGVlcCgxKTtcbiAgICAgICAgXy5rZXlzKGFwcGl1bS5zZXNzaW9ucykuc2hvdWxkLmNvbnRhaW4oc2Vzc2lvbklkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdnZXREcml2ZXJGb3JDYXBzJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBub3QgYmxvdyB1cCBpZiB1c2VyIGRvZXMgbm90IHByb3ZpZGUgcGxhdGZvcm1OYW1lJywgKCkgPT4ge1xuICAgICAgICBsZXQgYXBwaXVtID0gbmV3IEFwcGl1bURyaXZlcih7fSk7XG4gICAgICAgICgoKSA9PiB7IGFwcGl1bS5nZXREcml2ZXJGb3JDYXBzKHt9KTsgfSkuc2hvdWxkLnRocm93KC9wbGF0Zm9ybU5hbWUvKTtcbiAgICAgIH0pO1xuICAgICAgaXQoJ3Nob3VsZCBnZXQgWENVSVRlc3REcml2ZXIgZHJpdmVyIGZvciBhdXRvbWF0aW9uTmFtZSBvZiBYQ1VJVGVzdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGFwcGl1bSA9IG5ldyBBcHBpdW1Ecml2ZXIoe30pO1xuICAgICAgICBsZXQgZHJpdmVyID0gYXBwaXVtLmdldERyaXZlckZvckNhcHMoe1xuICAgICAgICAgIHBsYXRmb3JtTmFtZTogJ2lPUycsXG4gICAgICAgICAgYXV0b21hdGlvbk5hbWU6ICdYQ1VJVGVzdCdcbiAgICAgICAgfSk7XG4gICAgICAgIGRyaXZlci5zaG91bGQuYmUuYW4uaW5zdGFuY2VvZihGdW5jdGlvbik7XG4gICAgICAgIGRyaXZlci5zaG91bGQuZXF1YWwoWENVSVRlc3REcml2ZXIpO1xuICAgICAgfSk7XG4gICAgICBpdCgnc2hvdWxkIGdldCBpb3Nkcml2ZXIgZm9yIGlvcyA8IDEwJywgKCkgPT4ge1xuICAgICAgICBsZXQgYXBwaXVtID0gbmV3IEFwcGl1bURyaXZlcih7fSk7XG4gICAgICAgIGxldCBjYXBzID0ge1xuICAgICAgICAgIHBsYXRmb3JtTmFtZTogJ2lPUycsXG4gICAgICAgICAgcGxhdGZvcm1WZXJzaW9uOiAnOC4wJyxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGRyaXZlciA9IGFwcGl1bS5nZXREcml2ZXJGb3JDYXBzKGNhcHMpO1xuICAgICAgICBkcml2ZXIuc2hvdWxkLmJlLmFuLmluc3RhbmNlb2YoRnVuY3Rpb24pO1xuICAgICAgICBkcml2ZXIuc2hvdWxkLmVxdWFsKElvc0RyaXZlcik7XG5cbiAgICAgICAgY2Fwcy5wbGF0Zm9ybVZlcnNpb24gPSAnOC4xJztcbiAgICAgICAgZHJpdmVyID0gYXBwaXVtLmdldERyaXZlckZvckNhcHMoY2Fwcyk7XG4gICAgICAgIGRyaXZlci5zaG91bGQuZXF1YWwoSW9zRHJpdmVyKTtcblxuICAgICAgICBjYXBzLnBsYXRmb3JtVmVyc2lvbiA9ICc5LjQnO1xuICAgICAgICBkcml2ZXIgPSBhcHBpdW0uZ2V0RHJpdmVyRm9yQ2FwcyhjYXBzKTtcbiAgICAgICAgZHJpdmVyLnNob3VsZC5lcXVhbChJb3NEcml2ZXIpO1xuXG4gICAgICAgIGNhcHMucGxhdGZvcm1WZXJzaW9uID0gJyc7XG4gICAgICAgIGRyaXZlciA9IGFwcGl1bS5nZXREcml2ZXJGb3JDYXBzKGNhcHMpO1xuICAgICAgICBkcml2ZXIuc2hvdWxkLmVxdWFsKElvc0RyaXZlcik7XG5cbiAgICAgICAgY2Fwcy5wbGF0Zm9ybVZlcnNpb24gPSAnZm9vJztcbiAgICAgICAgZHJpdmVyID0gYXBwaXVtLmdldERyaXZlckZvckNhcHMoY2Fwcyk7XG4gICAgICAgIGRyaXZlci5zaG91bGQuZXF1YWwoSW9zRHJpdmVyKTtcblxuICAgICAgICBkZWxldGUgY2Fwcy5wbGF0Zm9ybVZlcnNpb247XG4gICAgICAgIGRyaXZlciA9IGFwcGl1bS5nZXREcml2ZXJGb3JDYXBzKGNhcHMpO1xuICAgICAgICBkcml2ZXIuc2hvdWxkLmVxdWFsKElvc0RyaXZlcik7XG4gICAgICB9KTtcbiAgICAgIGl0KCdzaG91bGQgZ2V0IHhjdWl0ZXN0ZHJpdmVyIGZvciBpb3MgPj0gMTAnLCAoKSA9PiB7XG4gICAgICAgIGxldCBhcHBpdW0gPSBuZXcgQXBwaXVtRHJpdmVyKHt9KTtcbiAgICAgICAgbGV0IGNhcHMgPSB7XG4gICAgICAgICAgcGxhdGZvcm1OYW1lOiAnaU9TJyxcbiAgICAgICAgICBwbGF0Zm9ybVZlcnNpb246ICcxMCcsXG4gICAgICAgIH07XG4gICAgICAgIGxldCBkcml2ZXIgPSBhcHBpdW0uZ2V0RHJpdmVyRm9yQ2FwcyhjYXBzKTtcbiAgICAgICAgZHJpdmVyLnNob3VsZC5iZS5hbi5pbnN0YW5jZW9mKEZ1bmN0aW9uKTtcbiAgICAgICAgZHJpdmVyLnNob3VsZC5lcXVhbChYQ1VJVGVzdERyaXZlcik7XG5cbiAgICAgICAgY2Fwcy5wbGF0Zm9ybVZlcnNpb24gPSAnMTAuMCc7XG4gICAgICAgIGRyaXZlciA9IGFwcGl1bS5nZXREcml2ZXJGb3JDYXBzKGNhcHMpO1xuICAgICAgICBkcml2ZXIuc2hvdWxkLmVxdWFsKFhDVUlUZXN0RHJpdmVyKTtcblxuICAgICAgICBjYXBzLnBsYXRmb3JtVmVyc2lvbiA9ICcxMC4xJztcbiAgICAgICAgZHJpdmVyID0gYXBwaXVtLmdldERyaXZlckZvckNhcHMoY2Fwcyk7XG4gICAgICAgIGRyaXZlci5zaG91bGQuZXF1YWwoWENVSVRlc3REcml2ZXIpO1xuXG4gICAgICAgIGNhcHMucGxhdGZvcm1WZXJzaW9uID0gJzEyLjE0JztcbiAgICAgICAgZHJpdmVyID0gYXBwaXVtLmdldERyaXZlckZvckNhcHMoY2Fwcyk7XG4gICAgICAgIGRyaXZlci5zaG91bGQuZXF1YWwoWENVSVRlc3REcml2ZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uIn0=
