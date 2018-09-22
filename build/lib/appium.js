'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('./config');

var _appiumBaseDriver = require('appium-base-driver');

var _appiumFakeDriver = require('appium-fake-driver');

var _appiumAndroidDriver = require('appium-android-driver');

var _appiumIosDriver = require('appium-ios-driver');

var _appiumUiautomator2Driver = require('appium-uiautomator2-driver');

var _appiumSelendroidDriver = require('appium-selendroid-driver');

var _appiumXcuitestDriver = require('appium-xcuitest-driver');

var _appiumYouiengineDriver = require('appium-youiengine-driver');

var _appiumWindowsDriver = require('appium-windows-driver');

var _appiumMacDriver = require('appium-mac-driver');

var _appiumEspressoDriver = require('appium-espresso-driver');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _asyncLock = require('async-lock');

var _asyncLock2 = _interopRequireDefault(_asyncLock);

var _utils = require('./utils');

// Force protocol to be MJSONWP until we start accepting W3C capabilities
_appiumBaseDriver.BaseDriver.determineProtocol = function () {
  return 'MJSONWP';
};

var sessionsListGuard = new _asyncLock2['default']();
var pendingDriversGuard = new _asyncLock2['default']();

var AppiumDriver = (function (_BaseDriver) {
  _inherits(AppiumDriver, _BaseDriver);

  function AppiumDriver(args) {
    _classCallCheck(this, AppiumDriver);

    _get(Object.getPrototypeOf(AppiumDriver.prototype), 'constructor', this).call(this);

    // the main Appium Driver has no new command timeout
    this.newCommandTimeoutMs = 0;

    this.args = _Object$assign({}, args);

    // Access to sessions list must be guarded with a Semaphore, because
    // it might be changed by other async calls at any time
    // It is not recommended to access this property directly from the outside
    this.sessions = {};

    // Access to pending drivers list must be guarded with a Semaphore, because
    // it might be changed by other async calls at any time
    // It is not recommended to access this property directly from the outside
    this.pendingDrivers = {};
  }

  // help decide which commands should be proxied to sub-drivers and which
  // should be handled by this, our umbrella driver

  /**
   * Cancel commands queueing for the umbrella Appium driver
   */

  _createClass(AppiumDriver, [{
    key: 'sessionExists',
    value: function sessionExists(sessionId) {
      var dstSession = this.sessions[sessionId];
      return dstSession && dstSession.sessionId !== null;
    }
  }, {
    key: 'driverForSession',
    value: function driverForSession(sessionId) {
      return this.sessions[sessionId];
    }
  }, {
    key: 'getDriverForCaps',
    value: function getDriverForCaps(caps) {
      // TODO if this logic ever becomes complex, should probably factor out
      // into its own file
      if (!caps.platformName || !_lodash2['default'].isString(caps.platformName)) {
        throw new Error("You must include a platformName capability");
      }

      // we don't necessarily have an `automationName` capability,
      if (caps.automationName) {
        if (caps.automationName.toLowerCase() === 'selendroid') {
          // but if we do and it is 'Selendroid', act on it
          return _appiumSelendroidDriver.SelendroidDriver;
        } else if (caps.automationName.toLowerCase() === 'uiautomator2') {
          // but if we do and it is 'Uiautomator2', act on it
          return _appiumUiautomator2Driver.AndroidUiautomator2Driver;
        } else if (caps.automationName.toLowerCase() === 'xcuitest') {
          // but if we do and it is 'XCUITest', act on it
          return _appiumXcuitestDriver.XCUITestDriver;
        } else if (caps.automationName.toLowerCase() === 'youiengine') {
          // but if we do and it is 'YouiEngine', act on it
          return _appiumYouiengineDriver.YouiEngineDriver;
        } else if (caps.automationName.toLowerCase() === 'espresso') {
          _logger2['default'].warn('The Appium Espresso driver is currently in early beta and meant only for experimental usage. Its API is not yet complete or guaranteed to work. Please report bugs to the Appium team on GitHub.');
          return _appiumEspressoDriver.EspressoDriver;
        }
      }

      if (caps.platformName.toLowerCase() === "fake") {
        return _appiumFakeDriver.FakeDriver;
      }

      if (caps.platformName.toLowerCase() === 'android') {
        return _appiumAndroidDriver.AndroidDriver;
      }

      if (caps.platformName.toLowerCase() === 'ios') {
        if (caps.platformVersion) {
          var majorVer = caps.platformVersion.toString().split(".")[0];
          if (parseInt(majorVer, 10) >= 10) {
            _logger2['default'].info("Requested iOS support with version >= 10, using XCUITest " + "driver instead of UIAutomation-based driver, since the " + "latter is unsupported on iOS 10 and up.");
            return _appiumXcuitestDriver.XCUITestDriver;
          }
        }

        return _appiumIosDriver.IosDriver;
      }

      if (caps.platformName.toLowerCase() === 'windows') {
        return _appiumWindowsDriver.WindowsDriver;
      }

      if (caps.platformName.toLowerCase() === 'mac') {
        return _appiumMacDriver.MacDriver;
      }

      var msg = undefined;
      if (caps.automationName) {
        msg = 'Could not find a driver for automationName \'' + caps.automationName + '\' and platformName ' + ('\'' + caps.platformName + '\'.');
      } else {
        msg = 'Could not find a driver for platformName \'' + caps.platformName + '\'.';
      }
      throw new Error(msg + ' Please check your desired capabilities.');
    }
  }, {
    key: 'getDriverVersion',
    value: function getDriverVersion(driver) {
      var NAME_DRIVER_MAP = {
        SelendroidDriver: 'appium-selendroid-driver',
        AndroidUiautomator2Driver: 'appium-uiautomator2-driver',
        XCUITestDriver: 'appium-xcuitest-driver',
        YouiEngineDriver: 'appium-youiengine-driver',
        FakeDriver: 'appium-fake-driver',
        AndroidDriver: 'appium-android-driver',
        IosDriver: 'appium-ios-driver',
        WindowsDriver: 'appium-windows-driver',
        MacDriver: 'appium-mac-driver'
      };
      if (!NAME_DRIVER_MAP[driver.name]) {
        _logger2['default'].warn('Unable to get version of driver \'' + driver.name + '\'');
        return;
      }

      var _require = require(NAME_DRIVER_MAP[driver.name] + '/package.json');

      var version = _require.version;

      return version;
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      var config, gitSha, status;
      return _regeneratorRuntime.async(function getStatus$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _config.getAppiumConfig)());

          case 2:
            config = context$2$0.sent;
            gitSha = config['git-sha'];
            status = { build: { version: config.version } };

            if (typeof gitSha !== "undefined") {
              status.build.revision = gitSha;
            }
            return context$2$0.abrupt('return', status);

          case 7:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getSessions',
    value: function getSessions() {
      var sessions;
      return _regeneratorRuntime.async(function getSessions$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              return _this.sessions;
            }));

          case 2:
            sessions = context$2$0.sent;
            return context$2$0.abrupt('return', _lodash2['default'].toPairs(sessions).map(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2);

              var id = _ref2[0];
              var driver = _ref2[1];

              return { id: id, capabilities: driver.caps };
            }));

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'printNewSessionAnnouncement',
    value: function printNewSessionAnnouncement(driver, caps) {
      var driverVersion = this.getDriverVersion(driver);
      var introString = driverVersion ? 'Creating new ' + driver.name + ' (v' + driverVersion + ') session' : 'Creating new ' + driver.name + ' session';
      _logger2['default'].info(introString);
      _logger2['default'].info('Capabilities:');
      (0, _utils.inspectObject)(caps);
    }

    /**
     * Create a new session
     * @param {Object} desiredCaps JSONWP formatted desired capabilities
     * @param {Object} reqCaps Required capabilities
     * @param {Object} capabilities W3C capabilities
     * @return {Array} Unique session ID and capabilities
     */
  }, {
    key: 'createSession',
    value: function createSession(desiredCaps, reqCaps, capabilities) {
      if(!(undefined === this.args.defaultCapabilities.webDriverAgentUrl)) {    
        desiredCaps.webDriverAgentUrl=this.args.defaultCapabilities.webDriverAgentUrl;
          // jsonwpCaps.webDriverAgentUrl=this.args.defaultCapabilities.webDriverAgentUrl;
      }
      if(!(undefined === this.args.defaultCapabilities.udid)) {    
        desiredCaps.udid=this.args.defaultCapabilities.udid;
          // jsonwpCaps.udid=this.args.defaultCapabilities.udid;
      }
      if (desiredCaps === undefined) desiredCaps = {};

      var w3cCaps, InnerDriver, sessionIdsToDelete, runningDriversData, otherPendingDriversData, d, innerSessionId, dCaps, _ref3, _ref32;

      return _regeneratorRuntime.async(function createSession$(context$2$0) {
        var _this2 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (capabilities) {
              // Merging W3C caps into desiredCaps is a stop-gap until all the clients and drivers become fully W3C compliant
              _logger2['default'].info('Merged W3C capabilities ' + _lodash2['default'].truncate(JSON.stringify(capabilities), { length: 50 }) + ' into desiredCapabilities object ' + _lodash2['default'].truncate(JSON.stringify(desiredCaps), { length: 50 }));
              w3cCaps = (0, _appiumBaseDriver.processCapabilities)(capabilities, null, false);

              desiredCaps = _lodash2['default'].merge(desiredCaps, w3cCaps);
            }
            desiredCaps = _lodash2['default'].defaults(_lodash2['default'].clone(desiredCaps), this.args.defaultCapabilities);
            InnerDriver = this.getDriverForCaps(desiredCaps);

            this.printNewSessionAnnouncement(InnerDriver, desiredCaps);

            if (!this.args.sessionOverride) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              return _lodash2['default'].keys(_this2.sessions);
            }));

          case 7:
            sessionIdsToDelete = context$2$0.sent;

            if (!sessionIdsToDelete.length) {
              context$2$0.next = 17;
              break;
            }

            _logger2['default'].info('Session override is on. Deleting other ' + sessionIdsToDelete.length + ' active session' + (sessionIdsToDelete.length ? '' : 's') + '.');
            context$2$0.prev = 10;
            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(_bluebird2['default'].map(sessionIdsToDelete, function (id) {
              return _this2.deleteSession(id);
            }));

          case 13:
            context$2$0.next = 17;
            break;

          case 15:
            context$2$0.prev = 15;
            context$2$0.t0 = context$2$0['catch'](10);

          case 17:
            runningDriversData = undefined, otherPendingDriversData = undefined;
            d = new InnerDriver(this.args);

            if (this.args.relaxedSecurityEnabled) {
              _logger2['default'].info('Applying relaxed security to ' + InnerDriver.name + ' as per server command line argument');
              d.relaxedSecurityEnabled = true;
            }
            context$2$0.prev = 20;
            context$2$0.next = 23;
            return _regeneratorRuntime.awrap(this.curSessionDataForDriver(InnerDriver));

          case 23:
            runningDriversData = context$2$0.sent;
            context$2$0.next = 29;
            break;

          case 26:
            context$2$0.prev = 26;
            context$2$0.t1 = context$2$0['catch'](20);
            throw new _appiumBaseDriver.errors.SessionNotCreatedError(context$2$0.t1.message);

          case 29:
            context$2$0.next = 31;
            return _regeneratorRuntime.awrap(pendingDriversGuard.acquire(AppiumDriver.name, function () {
              _this2.pendingDrivers[InnerDriver.name] = _this2.pendingDrivers[InnerDriver.name] || [];
              otherPendingDriversData = _this2.pendingDrivers[InnerDriver.name].map(function (drv) {
                return drv.driverData;
              });
              _this2.pendingDrivers[InnerDriver.name].push(d);
            }));

          case 31:
            innerSessionId = undefined, dCaps = undefined;
            context$2$0.prev = 32;
            context$2$0.next = 35;
            return _regeneratorRuntime.awrap(d.createSession(desiredCaps, reqCaps, [].concat(_toConsumableArray(runningDriversData), _toConsumableArray(otherPendingDriversData))));

          case 35:
            _ref3 = context$2$0.sent;
            _ref32 = _slicedToArray(_ref3, 2);
            innerSessionId = _ref32[0];
            dCaps = _ref32[1];
            context$2$0.next = 41;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              _this2.sessions[innerSessionId] = d;
            }));

          case 41:
            context$2$0.prev = 41;
            context$2$0.next = 44;
            return _regeneratorRuntime.awrap(pendingDriversGuard.acquire(AppiumDriver.name, function () {
              _lodash2['default'].pull(_this2.pendingDrivers[InnerDriver.name], d);
            }));

          case 44:
            return context$2$0.finish(41);

          case 45:

            // this is an async function but we don't await it because it handles
            // an out-of-band promise which is fulfilled if the inner driver
            // unexpectedly shuts down
            this.attachUnexpectedShutdownHandler(d, innerSessionId);

            _logger2['default'].info('New ' + InnerDriver.name + ' session created successfully, session ' + (innerSessionId + ' added to master session list'));

            // set the New Command Timeout for the inner driver
            d.startNewCommandTimeout();

            return context$2$0.abrupt('return', [innerSessionId, dCaps]);

          case 49:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[10, 15], [20, 26], [32,, 41, 45]]);
    }
  }, {
    key: 'attachUnexpectedShutdownHandler',
    value: function attachUnexpectedShutdownHandler(driver, innerSessionId) {
      return _regeneratorRuntime.async(function attachUnexpectedShutdownHandler$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(driver.onUnexpectedShutdown);

          case 3:
            throw new Error('Unexpected shutdown');

          case 6:
            context$2$0.prev = 6;
            context$2$0.t0 = context$2$0['catch'](0);

            if (!(context$2$0.t0 instanceof _bluebird2['default'].CancellationError)) {
              context$2$0.next = 10;
              break;
            }

            return context$2$0.abrupt('return');

          case 10:
            _logger2['default'].warn('Closing session, cause was \'' + context$2$0.t0.message + '\'');
            _logger2['default'].info('Removing session ' + innerSessionId + ' from our master session list');
            context$2$0.next = 14;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              delete _this3.sessions[innerSessionId];
            }));

          case 14:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[0, 6]]);
    }
  }, {
    key: 'curSessionDataForDriver',
    value: function curSessionDataForDriver(InnerDriver) {
      var sessions, data, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, datum;

      return _regeneratorRuntime.async(function curSessionDataForDriver$(context$2$0) {
        var _this4 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              return _this4.sessions;
            }));

          case 2:
            sessions = context$2$0.sent;
            data = _lodash2['default'].values(sessions).filter(function (s) {
              return s.constructor.name === InnerDriver.name;
            }).map(function (s) {
              return s.driverData;
            });
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            context$2$0.prev = 7;
            _iterator = _getIterator(data);

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              context$2$0.next = 16;
              break;
            }

            datum = _step.value;

            if (datum) {
              context$2$0.next = 13;
              break;
            }

            throw new Error('Problem getting session data for driver type ' + (InnerDriver.name + '; does it implement \'get ') + 'driverData\'?');

          case 13:
            _iteratorNormalCompletion = true;
            context$2$0.next = 9;
            break;

          case 16:
            context$2$0.next = 22;
            break;

          case 18:
            context$2$0.prev = 18;
            context$2$0.t0 = context$2$0['catch'](7);
            _didIteratorError = true;
            _iteratorError = context$2$0.t0;

          case 22:
            context$2$0.prev = 22;
            context$2$0.prev = 23;

            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }

          case 25:
            context$2$0.prev = 25;

            if (!_didIteratorError) {
              context$2$0.next = 28;
              break;
            }

            throw _iteratorError;

          case 28:
            return context$2$0.finish(25);

          case 29:
            return context$2$0.finish(22);

          case 30:
            return context$2$0.abrupt('return', data);

          case 31:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[7, 18, 22, 30], [23,, 25, 29]]);
    }
  }, {
    key: 'deleteSession',
    value: function deleteSession(sessionId) {
      var otherSessionsData, dstSession;
      return _regeneratorRuntime.async(function deleteSession$(context$2$0) {
        var _this5 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            otherSessionsData = null;
            dstSession = null;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              if (!_this5.sessions[sessionId]) {
                return;
              }
              var curConstructorName = _this5.sessions[sessionId].constructor.name;
              otherSessionsData = _lodash2['default'].toPairs(_this5.sessions).filter(function (_ref4) {
                var _ref42 = _slicedToArray(_ref4, 2);

                var key = _ref42[0];
                var value = _ref42[1];
                return value.constructor.name === curConstructorName && key !== sessionId;
              }).map(function (_ref5) {
                var _ref52 = _slicedToArray(_ref5, 2);

                var value = _ref52[1];
                return value.driverData;
              });
              dstSession = _this5.sessions[sessionId];
              _logger2['default'].info('Removing session ' + sessionId + ' from our master session list');
              // regardless of whether the deleteSession completes successfully or not
              // make the session unavailable, because who knows what state it might
              // be in otherwise
              delete _this5.sessions[sessionId];
            }));

          case 5:
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(dstSession.deleteSession(sessionId, otherSessionsData));

          case 7:
            context$2$0.next = 13;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](0);

            _logger2['default'].error('Had trouble ending session ' + sessionId + ': ' + context$2$0.t0.message);
            throw context$2$0.t0;

          case 13:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[0, 9]]);
    }
  }, {
    key: 'executeCommand',
    value: function executeCommand(cmd) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _get2, sessionId, dstSession;

      return _regeneratorRuntime.async(function executeCommand$(context$2$0) {
        var _this6 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(cmd === 'getStatus')) {
              context$2$0.next = 4;
              break;
            }

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.getStatus());

          case 3:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 4:
            if (!isAppiumDriverCommand(cmd)) {
              context$2$0.next = 8;
              break;
            }

            context$2$0.next = 7;
            return _regeneratorRuntime.awrap((_get2 = _get(Object.getPrototypeOf(AppiumDriver.prototype), 'executeCommand', this)).call.apply(_get2, [this, cmd].concat(args)));

          case 7:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 8:
            sessionId = _lodash2['default'].last(args);
            context$2$0.next = 11;
            return _regeneratorRuntime.awrap(sessionsListGuard.acquire(AppiumDriver.name, function () {
              return _this6.sessions[sessionId];
            }));

          case 11:
            dstSession = context$2$0.sent;

            if (dstSession) {
              context$2$0.next = 14;
              break;
            }

            throw new Error('The session with id \'' + sessionId + '\' does not exist');

          case 14:
            context$2$0.next = 16;
            return _regeneratorRuntime.awrap(dstSession.executeCommand.apply(dstSession, [cmd].concat(args)));

          case 16:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 17:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'proxyActive',
    value: function proxyActive(sessionId) {
      var dstSession = this.sessions[sessionId];
      return dstSession && _lodash2['default'].isFunction(dstSession.proxyActive) && dstSession.proxyActive(sessionId);
    }
  }, {
    key: 'getProxyAvoidList',
    value: function getProxyAvoidList(sessionId) {
      var dstSession = this.sessions[sessionId];
      return dstSession ? dstSession.getProxyAvoidList() : [];
    }
  }, {
    key: 'canProxy',
    value: function canProxy(sessionId) {
      var dstSession = this.sessions[sessionId];
      return dstSession && dstSession.canProxy(sessionId);
    }
  }, {
    key: 'isCommandsQueueEnabled',
    get: function get() {
      return false;
    }
  }]);

  return AppiumDriver;
})(_appiumBaseDriver.BaseDriver);

function isAppiumDriverCommand(cmd) {
  return !(0, _appiumBaseDriver.isSessionCommand)(cmd) || cmd === "deleteSession";
}

function getAppiumRouter(args) {
  var appium = new AppiumDriver(args);
  return (0, _appiumBaseDriver.routeConfiguringFunction)(appium);
}

exports.AppiumDriver = AppiumDriver;
exports.getAppiumRouter = getAppiumRouter;
exports['default'] = getAppiumRouter;

// TODO: When we support W3C pass in capabilities object

// Remove the session on unexpected shutdown, so that we are in a position
// to open another session later on.
// TODO: this should be removed and replaced by a onShutdown callback.
// this is a cancellable promise
// if we get here, we've had an unexpected shutdown, so error

// if we cancelled the unexpected shutdown promise, that means we
// no longer care about it, and can safely ignore it

// getStatus command should not be put into queue. If we do it as part of super.executeCommand, it will be added to queue.
// There will be lot of status commands in queue during createSession command, as createSession can take up to or more than a minute.
//# sourceMappingURL=data:application/json;charset=utf8;base64,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QU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxTQUFPLGdEQUF5QixNQUFNLENBQUMsQ0FBQztDQUN6Qzs7UUFFUSxZQUFZLEdBQVosWUFBWTtRQUFFLGVBQWUsR0FBZixlQUFlO3FCQUN2QixlQUFlIiwiZmlsZSI6ImxpYi9hcHBpdW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGxvZyBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRBcHBpdW1Db25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBCYXNlRHJpdmVyLCByb3V0ZUNvbmZpZ3VyaW5nRnVuY3Rpb24sIGVycm9ycyxcbiAgICAgICAgIGlzU2Vzc2lvbkNvbW1hbmQsIHByb2Nlc3NDYXBhYmlsaXRpZXMgfSBmcm9tICdhcHBpdW0tYmFzZS1kcml2ZXInO1xuaW1wb3J0IHsgRmFrZURyaXZlciB9IGZyb20gJ2FwcGl1bS1mYWtlLWRyaXZlcic7XG5pbXBvcnQgeyBBbmRyb2lkRHJpdmVyIH0gZnJvbSAnYXBwaXVtLWFuZHJvaWQtZHJpdmVyJztcbmltcG9ydCB7IElvc0RyaXZlciB9IGZyb20gJ2FwcGl1bS1pb3MtZHJpdmVyJztcbmltcG9ydCB7IEFuZHJvaWRVaWF1dG9tYXRvcjJEcml2ZXIgfSBmcm9tICdhcHBpdW0tdWlhdXRvbWF0b3IyLWRyaXZlcic7XG5pbXBvcnQgeyBTZWxlbmRyb2lkRHJpdmVyIH0gZnJvbSAnYXBwaXVtLXNlbGVuZHJvaWQtZHJpdmVyJztcbmltcG9ydCB7IFhDVUlUZXN0RHJpdmVyIH0gZnJvbSAnYXBwaXVtLXhjdWl0ZXN0LWRyaXZlcic7XG5pbXBvcnQgeyBZb3VpRW5naW5lRHJpdmVyIH0gZnJvbSAnYXBwaXVtLXlvdWllbmdpbmUtZHJpdmVyJztcbmltcG9ydCB7IFdpbmRvd3NEcml2ZXIgfSBmcm9tICdhcHBpdW0td2luZG93cy1kcml2ZXInO1xuaW1wb3J0IHsgTWFjRHJpdmVyIH0gZnJvbSAnYXBwaXVtLW1hYy1kcml2ZXInO1xuaW1wb3J0IHsgRXNwcmVzc29Ecml2ZXIgfSBmcm9tICdhcHBpdW0tZXNwcmVzc28tZHJpdmVyJztcbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBBc3luY0xvY2sgZnJvbSAnYXN5bmMtbG9jayc7XG5pbXBvcnQgeyBpbnNwZWN0T2JqZWN0IH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIEZvcmNlIHByb3RvY29sIHRvIGJlIE1KU09OV1AgdW50aWwgd2Ugc3RhcnQgYWNjZXB0aW5nIFczQyBjYXBhYmlsaXRpZXNcbkJhc2VEcml2ZXIuZGV0ZXJtaW5lUHJvdG9jb2wgPSAoKSA9PiAnTUpTT05XUCc7XG5cbmNvbnN0IHNlc3Npb25zTGlzdEd1YXJkID0gbmV3IEFzeW5jTG9jaygpO1xuY29uc3QgcGVuZGluZ0RyaXZlcnNHdWFyZCA9IG5ldyBBc3luY0xvY2soKTtcblxuY2xhc3MgQXBwaXVtRHJpdmVyIGV4dGVuZHMgQmFzZURyaXZlciB7XG4gIGNvbnN0cnVjdG9yIChhcmdzKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIHRoZSBtYWluIEFwcGl1bSBEcml2ZXIgaGFzIG5vIG5ldyBjb21tYW5kIHRpbWVvdXRcbiAgICB0aGlzLm5ld0NvbW1hbmRUaW1lb3V0TXMgPSAwO1xuXG4gICAgdGhpcy5hcmdzID0gT2JqZWN0LmFzc2lnbih7fSwgYXJncyk7XG5cbiAgICAvLyBBY2Nlc3MgdG8gc2Vzc2lvbnMgbGlzdCBtdXN0IGJlIGd1YXJkZWQgd2l0aCBhIFNlbWFwaG9yZSwgYmVjYXVzZVxuICAgIC8vIGl0IG1pZ2h0IGJlIGNoYW5nZWQgYnkgb3RoZXIgYXN5bmMgY2FsbHMgYXQgYW55IHRpbWVcbiAgICAvLyBJdCBpcyBub3QgcmVjb21tZW5kZWQgdG8gYWNjZXNzIHRoaXMgcHJvcGVydHkgZGlyZWN0bHkgZnJvbSB0aGUgb3V0c2lkZVxuICAgIHRoaXMuc2Vzc2lvbnMgPSB7fTtcblxuICAgIC8vIEFjY2VzcyB0byBwZW5kaW5nIGRyaXZlcnMgbGlzdCBtdXN0IGJlIGd1YXJkZWQgd2l0aCBhIFNlbWFwaG9yZSwgYmVjYXVzZVxuICAgIC8vIGl0IG1pZ2h0IGJlIGNoYW5nZWQgYnkgb3RoZXIgYXN5bmMgY2FsbHMgYXQgYW55IHRpbWVcbiAgICAvLyBJdCBpcyBub3QgcmVjb21tZW5kZWQgdG8gYWNjZXNzIHRoaXMgcHJvcGVydHkgZGlyZWN0bHkgZnJvbSB0aGUgb3V0c2lkZVxuICAgIHRoaXMucGVuZGluZ0RyaXZlcnMgPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgY29tbWFuZHMgcXVldWVpbmcgZm9yIHRoZSB1bWJyZWxsYSBBcHBpdW0gZHJpdmVyXG4gICAqL1xuICBnZXQgaXNDb21tYW5kc1F1ZXVlRW5hYmxlZCAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc2Vzc2lvbkV4aXN0cyAoc2Vzc2lvbklkKSB7XG4gICAgY29uc3QgZHN0U2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbnNbc2Vzc2lvbklkXTtcbiAgICByZXR1cm4gZHN0U2Vzc2lvbiAmJiBkc3RTZXNzaW9uLnNlc3Npb25JZCAhPT0gbnVsbDtcbiAgfVxuXG4gIGRyaXZlckZvclNlc3Npb24gKHNlc3Npb25JZCkge1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25zW3Nlc3Npb25JZF07XG4gIH1cblxuICBnZXREcml2ZXJGb3JDYXBzIChjYXBzKSB7XG4gICAgLy8gVE9ETyBpZiB0aGlzIGxvZ2ljIGV2ZXIgYmVjb21lcyBjb21wbGV4LCBzaG91bGQgcHJvYmFibHkgZmFjdG9yIG91dFxuICAgIC8vIGludG8gaXRzIG93biBmaWxlXG4gICAgaWYgKCFjYXBzLnBsYXRmb3JtTmFtZSB8fCAhXy5pc1N0cmluZyhjYXBzLnBsYXRmb3JtTmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGluY2x1ZGUgYSBwbGF0Zm9ybU5hbWUgY2FwYWJpbGl0eVwiKTtcbiAgICB9XG5cbiAgICAvLyB3ZSBkb24ndCBuZWNlc3NhcmlseSBoYXZlIGFuIGBhdXRvbWF0aW9uTmFtZWAgY2FwYWJpbGl0eSxcbiAgICBpZiAoY2Fwcy5hdXRvbWF0aW9uTmFtZSkge1xuICAgICAgaWYgKGNhcHMuYXV0b21hdGlvbk5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVuZHJvaWQnKSB7XG4gICAgICAgIC8vIGJ1dCBpZiB3ZSBkbyBhbmQgaXQgaXMgJ1NlbGVuZHJvaWQnLCBhY3Qgb24gaXRcbiAgICAgICAgcmV0dXJuIFNlbGVuZHJvaWREcml2ZXI7XG4gICAgICB9IGVsc2UgaWYgKGNhcHMuYXV0b21hdGlvbk5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3VpYXV0b21hdG9yMicpIHtcbiAgICAgICAgLy8gYnV0IGlmIHdlIGRvIGFuZCBpdCBpcyAnVWlhdXRvbWF0b3IyJywgYWN0IG9uIGl0XG4gICAgICAgIHJldHVybiBBbmRyb2lkVWlhdXRvbWF0b3IyRHJpdmVyO1xuICAgICAgfSBlbHNlIGlmIChjYXBzLmF1dG9tYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd4Y3VpdGVzdCcpIHtcbiAgICAgICAgLy8gYnV0IGlmIHdlIGRvIGFuZCBpdCBpcyAnWENVSVRlc3QnLCBhY3Qgb24gaXRcbiAgICAgICAgcmV0dXJuIFhDVUlUZXN0RHJpdmVyO1xuICAgICAgfSBlbHNlIGlmIChjYXBzLmF1dG9tYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd5b3VpZW5naW5lJykge1xuICAgICAgICAvLyBidXQgaWYgd2UgZG8gYW5kIGl0IGlzICdZb3VpRW5naW5lJywgYWN0IG9uIGl0XG4gICAgICAgIHJldHVybiBZb3VpRW5naW5lRHJpdmVyO1xuICAgICAgfSBlbHNlIGlmIChjYXBzLmF1dG9tYXRpb25OYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdlc3ByZXNzbycpIHtcbiAgICAgICAgbG9nLndhcm4oJ1RoZSBBcHBpdW0gRXNwcmVzc28gZHJpdmVyIGlzIGN1cnJlbnRseSBpbiBlYXJseSBiZXRhIGFuZCBtZWFudCBvbmx5IGZvciBleHBlcmltZW50YWwgdXNhZ2UuIEl0cyBBUEkgaXMgbm90IHlldCBjb21wbGV0ZSBvciBndWFyYW50ZWVkIHRvIHdvcmsuIFBsZWFzZSByZXBvcnQgYnVncyB0byB0aGUgQXBwaXVtIHRlYW0gb24gR2l0SHViLicpO1xuICAgICAgICByZXR1cm4gRXNwcmVzc29Ecml2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNhcHMucGxhdGZvcm1OYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiZmFrZVwiKSB7XG4gICAgICByZXR1cm4gRmFrZURyaXZlcjtcbiAgICB9XG5cbiAgICBpZiAoY2Fwcy5wbGF0Zm9ybU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FuZHJvaWQnKSB7XG4gICAgICByZXR1cm4gQW5kcm9pZERyaXZlcjtcbiAgICB9XG5cbiAgICBpZiAoY2Fwcy5wbGF0Zm9ybU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lvcycpIHtcbiAgICAgIGlmIChjYXBzLnBsYXRmb3JtVmVyc2lvbikge1xuICAgICAgICBsZXQgbWFqb3JWZXIgPSBjYXBzLnBsYXRmb3JtVmVyc2lvbi50b1N0cmluZygpLnNwbGl0KFwiLlwiKVswXTtcbiAgICAgICAgaWYgKHBhcnNlSW50KG1ham9yVmVyLCAxMCkgPj0gMTApIHtcbiAgICAgICAgICBsb2cuaW5mbyhcIlJlcXVlc3RlZCBpT1Mgc3VwcG9ydCB3aXRoIHZlcnNpb24gPj0gMTAsIHVzaW5nIFhDVUlUZXN0IFwiICtcbiAgICAgICAgICAgICAgICAgICBcImRyaXZlciBpbnN0ZWFkIG9mIFVJQXV0b21hdGlvbi1iYXNlZCBkcml2ZXIsIHNpbmNlIHRoZSBcIiArXG4gICAgICAgICAgICAgICAgICAgXCJsYXR0ZXIgaXMgdW5zdXBwb3J0ZWQgb24gaU9TIDEwIGFuZCB1cC5cIik7XG4gICAgICAgICAgcmV0dXJuIFhDVUlUZXN0RHJpdmVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBJb3NEcml2ZXI7XG4gICAgfVxuXG4gICAgaWYgKGNhcHMucGxhdGZvcm1OYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd3aW5kb3dzJykge1xuICAgICAgcmV0dXJuIFdpbmRvd3NEcml2ZXI7XG4gICAgfVxuXG4gICAgaWYgKGNhcHMucGxhdGZvcm1OYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdtYWMnKSB7XG4gICAgICByZXR1cm4gTWFjRHJpdmVyO1xuICAgIH1cblxuICAgIGxldCBtc2c7XG4gICAgaWYgKGNhcHMuYXV0b21hdGlvbk5hbWUpIHtcbiAgICAgIG1zZyA9IGBDb3VsZCBub3QgZmluZCBhIGRyaXZlciBmb3IgYXV0b21hdGlvbk5hbWUgJyR7Y2Fwcy5hdXRvbWF0aW9uTmFtZX0nIGFuZCBwbGF0Zm9ybU5hbWUgYCArXG4gICAgICAgICAgICBgJyR7Y2Fwcy5wbGF0Zm9ybU5hbWV9Jy5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBtc2cgPSBgQ291bGQgbm90IGZpbmQgYSBkcml2ZXIgZm9yIHBsYXRmb3JtTmFtZSAnJHtjYXBzLnBsYXRmb3JtTmFtZX0nLmA7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgJHttc2d9IFBsZWFzZSBjaGVjayB5b3VyIGRlc2lyZWQgY2FwYWJpbGl0aWVzLmApO1xuICB9XG5cbiAgZ2V0RHJpdmVyVmVyc2lvbiAoZHJpdmVyKSB7XG4gICAgY29uc3QgTkFNRV9EUklWRVJfTUFQID0ge1xuICAgICAgU2VsZW5kcm9pZERyaXZlcjogJ2FwcGl1bS1zZWxlbmRyb2lkLWRyaXZlcicsXG4gICAgICBBbmRyb2lkVWlhdXRvbWF0b3IyRHJpdmVyOiAnYXBwaXVtLXVpYXV0b21hdG9yMi1kcml2ZXInLFxuICAgICAgWENVSVRlc3REcml2ZXI6ICdhcHBpdW0teGN1aXRlc3QtZHJpdmVyJyxcbiAgICAgIFlvdWlFbmdpbmVEcml2ZXI6ICdhcHBpdW0teW91aWVuZ2luZS1kcml2ZXInLFxuICAgICAgRmFrZURyaXZlcjogJ2FwcGl1bS1mYWtlLWRyaXZlcicsXG4gICAgICBBbmRyb2lkRHJpdmVyOiAnYXBwaXVtLWFuZHJvaWQtZHJpdmVyJyxcbiAgICAgIElvc0RyaXZlcjogJ2FwcGl1bS1pb3MtZHJpdmVyJyxcbiAgICAgIFdpbmRvd3NEcml2ZXI6ICdhcHBpdW0td2luZG93cy1kcml2ZXInLFxuICAgICAgTWFjRHJpdmVyOiAnYXBwaXVtLW1hYy1kcml2ZXInLFxuICAgIH07XG4gICAgaWYgKCFOQU1FX0RSSVZFUl9NQVBbZHJpdmVyLm5hbWVdKSB7XG4gICAgICBsb2cud2FybihgVW5hYmxlIHRvIGdldCB2ZXJzaW9uIG9mIGRyaXZlciAnJHtkcml2ZXIubmFtZX0nYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB7dmVyc2lvbn0gPSByZXF1aXJlKGAke05BTUVfRFJJVkVSX01BUFtkcml2ZXIubmFtZV19L3BhY2thZ2UuanNvbmApO1xuICAgIHJldHVybiB2ZXJzaW9uO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3RhdHVzICgpIHtcbiAgICBsZXQgY29uZmlnID0gYXdhaXQgZ2V0QXBwaXVtQ29uZmlnKCk7XG4gICAgbGV0IGdpdFNoYSA9IGNvbmZpZ1snZ2l0LXNoYSddO1xuICAgIGxldCBzdGF0dXMgPSB7YnVpbGQ6IHt2ZXJzaW9uOiBjb25maWcudmVyc2lvbn19O1xuICAgIGlmICh0eXBlb2YgZ2l0U2hhICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBzdGF0dXMuYnVpbGQucmV2aXNpb24gPSBnaXRTaGE7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXM7XG4gIH1cblxuICBhc3luYyBnZXRTZXNzaW9ucyAoKSB7XG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBhd2FpdCBzZXNzaW9uc0xpc3RHdWFyZC5hY3F1aXJlKEFwcGl1bURyaXZlci5uYW1lLCAoKSA9PiB0aGlzLnNlc3Npb25zKTtcbiAgICByZXR1cm4gXy50b1BhaXJzKHNlc3Npb25zKVxuICAgICAgICAubWFwKChbaWQsIGRyaXZlcl0pID0+IHtcbiAgICAgICAgICByZXR1cm4ge2lkLCBjYXBhYmlsaXRpZXM6IGRyaXZlci5jYXBzfTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcmludE5ld1Nlc3Npb25Bbm5vdW5jZW1lbnQgKGRyaXZlciwgY2Fwcykge1xuICAgIGxldCBkcml2ZXJWZXJzaW9uID0gdGhpcy5nZXREcml2ZXJWZXJzaW9uKGRyaXZlcik7XG4gICAgbGV0IGludHJvU3RyaW5nID0gZHJpdmVyVmVyc2lvbiA/XG4gICAgICBgQ3JlYXRpbmcgbmV3ICR7ZHJpdmVyLm5hbWV9ICh2JHtkcml2ZXJWZXJzaW9ufSkgc2Vzc2lvbmAgOlxuICAgICAgYENyZWF0aW5nIG5ldyAke2RyaXZlci5uYW1lfSBzZXNzaW9uYDtcbiAgICBsb2cuaW5mbyhpbnRyb1N0cmluZyk7XG4gICAgbG9nLmluZm8oJ0NhcGFiaWxpdGllczonKTtcbiAgICBpbnNwZWN0T2JqZWN0KGNhcHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzZXNzaW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkZXNpcmVkQ2FwcyBKU09OV1AgZm9ybWF0dGVkIGRlc2lyZWQgY2FwYWJpbGl0aWVzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXFDYXBzIFJlcXVpcmVkIGNhcGFiaWxpdGllc1xuICAgKiBAcGFyYW0ge09iamVjdH0gY2FwYWJpbGl0aWVzIFczQyBjYXBhYmlsaXRpZXNcbiAgICogQHJldHVybiB7QXJyYXl9IFVuaXF1ZSBzZXNzaW9uIElEIGFuZCBjYXBhYmlsaXRpZXNcbiAgICovXG4gIGFzeW5jIGNyZWF0ZVNlc3Npb24gKGRlc2lyZWRDYXBzPXt9LCByZXFDYXBzLCBjYXBhYmlsaXRpZXMpIHtcbiAgICBpZiAoY2FwYWJpbGl0aWVzKSB7XG4gICAgICAvLyBNZXJnaW5nIFczQyBjYXBzIGludG8gZGVzaXJlZENhcHMgaXMgYSBzdG9wLWdhcCB1bnRpbCBhbGwgdGhlIGNsaWVudHMgYW5kIGRyaXZlcnMgYmVjb21lIGZ1bGx5IFczQyBjb21wbGlhbnRcbiAgICAgIGxvZy5pbmZvKGBNZXJnZWQgVzNDIGNhcGFiaWxpdGllcyAke18udHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoY2FwYWJpbGl0aWVzKSwge2xlbmd0aDogNTB9KX0gaW50byBkZXNpcmVkQ2FwYWJpbGl0aWVzIG9iamVjdCAke18udHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoZGVzaXJlZENhcHMpLCB7bGVuZ3RoOiA1MH0pfWApO1xuICAgICAgbGV0IHczY0NhcHMgPSBwcm9jZXNzQ2FwYWJpbGl0aWVzKGNhcGFiaWxpdGllcywgbnVsbCwgZmFsc2UpO1xuICAgICAgZGVzaXJlZENhcHMgPSBfLm1lcmdlKGRlc2lyZWRDYXBzLCB3M2NDYXBzKTtcbiAgICB9XG4gICAgZGVzaXJlZENhcHMgPSBfLmRlZmF1bHRzKF8uY2xvbmUoZGVzaXJlZENhcHMpLCB0aGlzLmFyZ3MuZGVmYXVsdENhcGFiaWxpdGllcyk7XG4gICAgbGV0IElubmVyRHJpdmVyID0gdGhpcy5nZXREcml2ZXJGb3JDYXBzKGRlc2lyZWRDYXBzKTtcbiAgICB0aGlzLnByaW50TmV3U2Vzc2lvbkFubm91bmNlbWVudChJbm5lckRyaXZlciwgZGVzaXJlZENhcHMpO1xuXG4gICAgaWYgKHRoaXMuYXJncy5zZXNzaW9uT3ZlcnJpZGUpIHtcbiAgICAgIGNvbnN0IHNlc3Npb25JZHNUb0RlbGV0ZSA9IGF3YWl0IHNlc3Npb25zTGlzdEd1YXJkLmFjcXVpcmUoQXBwaXVtRHJpdmVyLm5hbWUsICgpID0+IF8ua2V5cyh0aGlzLnNlc3Npb25zKSk7XG4gICAgICBpZiAoc2Vzc2lvbklkc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICBsb2cuaW5mbyhgU2Vzc2lvbiBvdmVycmlkZSBpcyBvbi4gRGVsZXRpbmcgb3RoZXIgJHtzZXNzaW9uSWRzVG9EZWxldGUubGVuZ3RofSBhY3RpdmUgc2Vzc2lvbiR7c2Vzc2lvbklkc1RvRGVsZXRlLmxlbmd0aCA/ICcnIDogJ3MnfS5gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBCLm1hcChzZXNzaW9uSWRzVG9EZWxldGUsIChpZCkgPT4gdGhpcy5kZWxldGVTZXNzaW9uKGlkKSk7XG4gICAgICAgIH0gY2F0Y2ggKGlnbikge31cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcnVubmluZ0RyaXZlcnNEYXRhLCBvdGhlclBlbmRpbmdEcml2ZXJzRGF0YTtcbiAgICBsZXQgZCA9IG5ldyBJbm5lckRyaXZlcih0aGlzLmFyZ3MpO1xuICAgIGlmICh0aGlzLmFyZ3MucmVsYXhlZFNlY3VyaXR5RW5hYmxlZCkge1xuICAgICAgbG9nLmluZm8oYEFwcGx5aW5nIHJlbGF4ZWQgc2VjdXJpdHkgdG8gJHtJbm5lckRyaXZlci5uYW1lfSBhcyBwZXIgc2VydmVyIGNvbW1hbmQgbGluZSBhcmd1bWVudGApO1xuICAgICAgZC5yZWxheGVkU2VjdXJpdHlFbmFibGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJ1bm5pbmdEcml2ZXJzRGF0YSA9IGF3YWl0IHRoaXMuY3VyU2Vzc2lvbkRhdGFGb3JEcml2ZXIoSW5uZXJEcml2ZXIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBlcnJvcnMuU2Vzc2lvbk5vdENyZWF0ZWRFcnJvcihlLm1lc3NhZ2UpO1xuICAgIH1cbiAgICBhd2FpdCBwZW5kaW5nRHJpdmVyc0d1YXJkLmFjcXVpcmUoQXBwaXVtRHJpdmVyLm5hbWUsICgpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ0RyaXZlcnNbSW5uZXJEcml2ZXIubmFtZV0gPSB0aGlzLnBlbmRpbmdEcml2ZXJzW0lubmVyRHJpdmVyLm5hbWVdIHx8IFtdO1xuICAgICAgb3RoZXJQZW5kaW5nRHJpdmVyc0RhdGEgPSB0aGlzLnBlbmRpbmdEcml2ZXJzW0lubmVyRHJpdmVyLm5hbWVdLm1hcCgoZHJ2KSA9PiBkcnYuZHJpdmVyRGF0YSk7XG4gICAgICB0aGlzLnBlbmRpbmdEcml2ZXJzW0lubmVyRHJpdmVyLm5hbWVdLnB1c2goZCk7XG4gICAgfSk7XG4gICAgbGV0IGlubmVyU2Vzc2lvbklkLCBkQ2FwcztcbiAgICB0cnkge1xuICAgICAgLy8gVE9ETzogV2hlbiB3ZSBzdXBwb3J0IFczQyBwYXNzIGluIGNhcGFiaWxpdGllcyBvYmplY3RcbiAgICAgIFtpbm5lclNlc3Npb25JZCwgZENhcHNdID0gYXdhaXQgZC5jcmVhdGVTZXNzaW9uKGRlc2lyZWRDYXBzLCByZXFDYXBzLCBbLi4ucnVubmluZ0RyaXZlcnNEYXRhLCAuLi5vdGhlclBlbmRpbmdEcml2ZXJzRGF0YV0pO1xuICAgICAgYXdhaXQgc2Vzc2lvbnNMaXN0R3VhcmQuYWNxdWlyZShBcHBpdW1Ecml2ZXIubmFtZSwgKCkgPT4ge1xuICAgICAgICB0aGlzLnNlc3Npb25zW2lubmVyU2Vzc2lvbklkXSA9IGQ7XG4gICAgICB9KTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgcGVuZGluZ0RyaXZlcnNHdWFyZC5hY3F1aXJlKEFwcGl1bURyaXZlci5uYW1lLCAoKSA9PiB7XG4gICAgICAgIF8ucHVsbCh0aGlzLnBlbmRpbmdEcml2ZXJzW0lubmVyRHJpdmVyLm5hbWVdLCBkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgYW4gYXN5bmMgZnVuY3Rpb24gYnV0IHdlIGRvbid0IGF3YWl0IGl0IGJlY2F1c2UgaXQgaGFuZGxlc1xuICAgIC8vIGFuIG91dC1vZi1iYW5kIHByb21pc2Ugd2hpY2ggaXMgZnVsZmlsbGVkIGlmIHRoZSBpbm5lciBkcml2ZXJcbiAgICAvLyB1bmV4cGVjdGVkbHkgc2h1dHMgZG93blxuICAgIHRoaXMuYXR0YWNoVW5leHBlY3RlZFNodXRkb3duSGFuZGxlcihkLCBpbm5lclNlc3Npb25JZCk7XG5cblxuICAgIGxvZy5pbmZvKGBOZXcgJHtJbm5lckRyaXZlci5uYW1lfSBzZXNzaW9uIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LCBzZXNzaW9uIGAgK1xuICAgICAgICAgICAgIGAke2lubmVyU2Vzc2lvbklkfSBhZGRlZCB0byBtYXN0ZXIgc2Vzc2lvbiBsaXN0YCk7XG5cbiAgICAvLyBzZXQgdGhlIE5ldyBDb21tYW5kIFRpbWVvdXQgZm9yIHRoZSBpbm5lciBkcml2ZXJcbiAgICBkLnN0YXJ0TmV3Q29tbWFuZFRpbWVvdXQoKTtcblxuICAgIHJldHVybiBbaW5uZXJTZXNzaW9uSWQsIGRDYXBzXTtcbiAgfVxuXG4gIGFzeW5jIGF0dGFjaFVuZXhwZWN0ZWRTaHV0ZG93bkhhbmRsZXIgKGRyaXZlciwgaW5uZXJTZXNzaW9uSWQpIHtcbiAgICAvLyBSZW1vdmUgdGhlIHNlc3Npb24gb24gdW5leHBlY3RlZCBzaHV0ZG93biwgc28gdGhhdCB3ZSBhcmUgaW4gYSBwb3NpdGlvblxuICAgIC8vIHRvIG9wZW4gYW5vdGhlciBzZXNzaW9uIGxhdGVyIG9uLlxuICAgIC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIHJlbW92ZWQgYW5kIHJlcGxhY2VkIGJ5IGEgb25TaHV0ZG93biBjYWxsYmFjay5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgZHJpdmVyLm9uVW5leHBlY3RlZFNodXRkb3duOyAvLyB0aGlzIGlzIGEgY2FuY2VsbGFibGUgcHJvbWlzZVxuICAgICAgLy8gaWYgd2UgZ2V0IGhlcmUsIHdlJ3ZlIGhhZCBhbiB1bmV4cGVjdGVkIHNodXRkb3duLCBzbyBlcnJvclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIHNodXRkb3duJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBCLkNhbmNlbGxhdGlvbkVycm9yKSB7XG4gICAgICAgIC8vIGlmIHdlIGNhbmNlbGxlZCB0aGUgdW5leHBlY3RlZCBzaHV0ZG93biBwcm9taXNlLCB0aGF0IG1lYW5zIHdlXG4gICAgICAgIC8vIG5vIGxvbmdlciBjYXJlIGFib3V0IGl0LCBhbmQgY2FuIHNhZmVseSBpZ25vcmUgaXRcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nLndhcm4oYENsb3Npbmcgc2Vzc2lvbiwgY2F1c2Ugd2FzICcke2UubWVzc2FnZX0nYCk7XG4gICAgICBsb2cuaW5mbyhgUmVtb3Zpbmcgc2Vzc2lvbiAke2lubmVyU2Vzc2lvbklkfSBmcm9tIG91ciBtYXN0ZXIgc2Vzc2lvbiBsaXN0YCk7XG4gICAgICBhd2FpdCBzZXNzaW9uc0xpc3RHdWFyZC5hY3F1aXJlKEFwcGl1bURyaXZlci5uYW1lLCAoKSA9PiB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNlc3Npb25zW2lubmVyU2Vzc2lvbklkXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGN1clNlc3Npb25EYXRhRm9yRHJpdmVyIChJbm5lckRyaXZlcikge1xuICAgIGNvbnN0IHNlc3Npb25zID0gYXdhaXQgc2Vzc2lvbnNMaXN0R3VhcmQuYWNxdWlyZShBcHBpdW1Ecml2ZXIubmFtZSwgKCkgPT4gdGhpcy5zZXNzaW9ucyk7XG4gICAgY29uc3QgZGF0YSA9IF8udmFsdWVzKHNlc3Npb25zKVxuICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHMpID0+IHMuY29uc3RydWN0b3IubmFtZSA9PT0gSW5uZXJEcml2ZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgICAubWFwKChzKSA9PiBzLmRyaXZlckRhdGEpO1xuICAgIGZvciAobGV0IGRhdHVtIG9mIGRhdGEpIHtcbiAgICAgIGlmICghZGF0dW0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9ibGVtIGdldHRpbmcgc2Vzc2lvbiBkYXRhIGZvciBkcml2ZXIgdHlwZSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke0lubmVyRHJpdmVyLm5hbWV9OyBkb2VzIGl0IGltcGxlbWVudCAnZ2V0IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYGRyaXZlckRhdGEnP2ApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZVNlc3Npb24gKHNlc3Npb25JZCkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgb3RoZXJTZXNzaW9uc0RhdGEgPSBudWxsO1xuICAgICAgbGV0IGRzdFNlc3Npb24gPSBudWxsO1xuICAgICAgYXdhaXQgc2Vzc2lvbnNMaXN0R3VhcmQuYWNxdWlyZShBcHBpdW1Ecml2ZXIubmFtZSwgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc2Vzc2lvbnNbc2Vzc2lvbklkXSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdXJDb25zdHJ1Y3Rvck5hbWUgPSB0aGlzLnNlc3Npb25zW3Nlc3Npb25JZF0uY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgb3RoZXJTZXNzaW9uc0RhdGEgPSBfLnRvUGFpcnModGhpcy5zZXNzaW9ucylcbiAgICAgICAgICAgICAgLmZpbHRlcigoW2tleSwgdmFsdWVdKSA9PiB2YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lID09PSBjdXJDb25zdHJ1Y3Rvck5hbWUgJiYga2V5ICE9PSBzZXNzaW9uSWQpXG4gICAgICAgICAgICAgIC5tYXAoKFssIHZhbHVlXSkgPT4gdmFsdWUuZHJpdmVyRGF0YSk7XG4gICAgICAgIGRzdFNlc3Npb24gPSB0aGlzLnNlc3Npb25zW3Nlc3Npb25JZF07XG4gICAgICAgIGxvZy5pbmZvKGBSZW1vdmluZyBzZXNzaW9uICR7c2Vzc2lvbklkfSBmcm9tIG91ciBtYXN0ZXIgc2Vzc2lvbiBsaXN0YCk7XG4gICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgZGVsZXRlU2Vzc2lvbiBjb21wbGV0ZXMgc3VjY2Vzc2Z1bGx5IG9yIG5vdFxuICAgICAgICAvLyBtYWtlIHRoZSBzZXNzaW9uIHVuYXZhaWxhYmxlLCBiZWNhdXNlIHdobyBrbm93cyB3aGF0IHN0YXRlIGl0IG1pZ2h0XG4gICAgICAgIC8vIGJlIGluIG90aGVyd2lzZVxuICAgICAgICBkZWxldGUgdGhpcy5zZXNzaW9uc1tzZXNzaW9uSWRdO1xuICAgICAgfSk7XG4gICAgICBhd2FpdCBkc3RTZXNzaW9uLmRlbGV0ZVNlc3Npb24oc2Vzc2lvbklkLCBvdGhlclNlc3Npb25zRGF0YSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nLmVycm9yKGBIYWQgdHJvdWJsZSBlbmRpbmcgc2Vzc2lvbiAke3Nlc3Npb25JZH06ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBleGVjdXRlQ29tbWFuZCAoY21kLCAuLi5hcmdzKSB7XG4gICAgLy8gZ2V0U3RhdHVzIGNvbW1hbmQgc2hvdWxkIG5vdCBiZSBwdXQgaW50byBxdWV1ZS4gSWYgd2UgZG8gaXQgYXMgcGFydCBvZiBzdXBlci5leGVjdXRlQ29tbWFuZCwgaXQgd2lsbCBiZSBhZGRlZCB0byBxdWV1ZS5cbiAgICAvLyBUaGVyZSB3aWxsIGJlIGxvdCBvZiBzdGF0dXMgY29tbWFuZHMgaW4gcXVldWUgZHVyaW5nIGNyZWF0ZVNlc3Npb24gY29tbWFuZCwgYXMgY3JlYXRlU2Vzc2lvbiBjYW4gdGFrZSB1cCB0byBvciBtb3JlIHRoYW4gYSBtaW51dGUuXG4gICAgaWYgKGNtZCA9PT0gJ2dldFN0YXR1cycpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFN0YXR1cygpO1xuICAgIH1cbiAgICBpZiAoaXNBcHBpdW1Ecml2ZXJDb21tYW5kKGNtZCkpIHtcbiAgICAgIHJldHVybiBhd2FpdCBzdXBlci5leGVjdXRlQ29tbWFuZChjbWQsIC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIGNvbnN0IHNlc3Npb25JZCA9IF8ubGFzdChhcmdzKTtcbiAgICBjb25zdCBkc3RTZXNzaW9uID0gYXdhaXQgc2Vzc2lvbnNMaXN0R3VhcmQuYWNxdWlyZShBcHBpdW1Ecml2ZXIubmFtZSwgKCkgPT4gdGhpcy5zZXNzaW9uc1tzZXNzaW9uSWRdKTtcbiAgICBpZiAoIWRzdFNlc3Npb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHNlc3Npb24gd2l0aCBpZCAnJHtzZXNzaW9uSWR9JyBkb2VzIG5vdCBleGlzdGApO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgZHN0U2Vzc2lvbi5leGVjdXRlQ29tbWFuZChjbWQsIC4uLmFyZ3MpO1xuICB9XG5cbiAgcHJveHlBY3RpdmUgKHNlc3Npb25JZCkge1xuICAgIGNvbnN0IGRzdFNlc3Npb24gPSB0aGlzLnNlc3Npb25zW3Nlc3Npb25JZF07XG4gICAgcmV0dXJuIGRzdFNlc3Npb24gJiYgXy5pc0Z1bmN0aW9uKGRzdFNlc3Npb24ucHJveHlBY3RpdmUpICYmIGRzdFNlc3Npb24ucHJveHlBY3RpdmUoc2Vzc2lvbklkKTtcbiAgfVxuXG4gIGdldFByb3h5QXZvaWRMaXN0IChzZXNzaW9uSWQpIHtcbiAgICBjb25zdCBkc3RTZXNzaW9uID0gdGhpcy5zZXNzaW9uc1tzZXNzaW9uSWRdO1xuICAgIHJldHVybiBkc3RTZXNzaW9uID8gZHN0U2Vzc2lvbi5nZXRQcm94eUF2b2lkTGlzdCgpIDogW107XG4gIH1cblxuICBjYW5Qcm94eSAoc2Vzc2lvbklkKSB7XG4gICAgY29uc3QgZHN0U2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbnNbc2Vzc2lvbklkXTtcbiAgICByZXR1cm4gZHN0U2Vzc2lvbiAmJiBkc3RTZXNzaW9uLmNhblByb3h5KHNlc3Npb25JZCk7XG4gIH1cbn1cblxuLy8gaGVscCBkZWNpZGUgd2hpY2ggY29tbWFuZHMgc2hvdWxkIGJlIHByb3hpZWQgdG8gc3ViLWRyaXZlcnMgYW5kIHdoaWNoXG4vLyBzaG91bGQgYmUgaGFuZGxlZCBieSB0aGlzLCBvdXIgdW1icmVsbGEgZHJpdmVyXG5mdW5jdGlvbiBpc0FwcGl1bURyaXZlckNvbW1hbmQgKGNtZCkge1xuICByZXR1cm4gIWlzU2Vzc2lvbkNvbW1hbmQoY21kKSB8fCBjbWQgPT09IFwiZGVsZXRlU2Vzc2lvblwiO1xufVxuXG5mdW5jdGlvbiBnZXRBcHBpdW1Sb3V0ZXIgKGFyZ3MpIHtcbiAgbGV0IGFwcGl1bSA9IG5ldyBBcHBpdW1Ecml2ZXIoYXJncyk7XG4gIHJldHVybiByb3V0ZUNvbmZpZ3VyaW5nRnVuY3Rpb24oYXBwaXVtKTtcbn1cblxuZXhwb3J0IHsgQXBwaXVtRHJpdmVyLCBnZXRBcHBpdW1Sb3V0ZXIgfTtcbmV4cG9ydCBkZWZhdWx0IGdldEFwcGl1bVJvdXRlcjtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4ifQ==
