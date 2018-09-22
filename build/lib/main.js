#!/usr/bin/env node

require('source-map-support').install();

'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _logsink = require('./logsink');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

// logger needs to remain first of imports

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumBaseDriver = require('appium-base-driver');

var _asyncbox = require('asyncbox');

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _config = require('./config');

var _appium = require('./appium');

var _appium2 = _interopRequireDefault(_appium);

var _gridRegister = require('./grid-register');

var _gridRegister2 = _interopRequireDefault(_gridRegister);

var _utils = require('./utils');

function preflightChecks(parser, args) {
  var throwInsteadOfExit = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
  return _regeneratorRuntime.async(function preflightChecks$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;

        (0, _config.checkNodeOk)();
        if (args.asyncTrace) {
          require('longjohn').async_trace_limit = -1;
        }

        if (!args.showConfig) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.next = 6;
        return _regeneratorRuntime.awrap((0, _config.showConfig)());

      case 6:
        process.exit(0);

      case 7:
        (0, _config.warnNodeDeprecations)();
        (0, _config.validateServerArgs)(parser, args);

        if (!args.tmpDir) {
          context$1$0.next = 12;
          break;
        }

        context$1$0.next = 12;
        return _regeneratorRuntime.awrap((0, _config.validateTmpDir)(args.tmpDir));

      case 12:
        context$1$0.next = 20;
        break;

      case 14:
        context$1$0.prev = 14;
        context$1$0.t0 = context$1$0['catch'](0);

        _logger2['default'].error(context$1$0.t0.message.red);

        if (!throwInsteadOfExit) {
          context$1$0.next = 19;
          break;
        }

        throw context$1$0.t0;

      case 19:

        process.exit(1);

      case 20:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[0, 14]]);
}

function logDeprecationWarning(deprecatedArgs) {
  _logger2['default'].warn('Deprecated server args:');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _getIterator(_lodash2['default'].toPairs(deprecatedArgs)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2);

      var arg = _step$value[0];
      var realArg = _step$value[1];

      _logger2['default'].warn('  ' + arg.red + ' => ' + realArg);
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
}

function logNonDefaultArgsWarning(args) {
  _logger2['default'].info('Non-default server args:');
  (0, _utils.inspectObject)(args);
}

function logDefaultCapabilitiesWarning(caps) {
  _logger2['default'].info('Default capabilities, which will be added to each request ' + 'unless overridden by desired capabilities:');
  (0, _utils.inspectObject)(caps);
}

function logStartupInfo(parser, args) {
  var welcome, appiumRev, showArgs, deprecatedArgs;
  return _regeneratorRuntime.async(function logStartupInfo$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        welcome = 'Welcome to Appium v' + _config.APPIUM_VER;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap((0, _config.getGitRev)());

      case 3:
        appiumRev = context$1$0.sent;

        if (appiumRev) {
          welcome += ' (REV ' + appiumRev + ')';
        }
        _logger2['default'].info(welcome);

        showArgs = (0, _config.getNonDefaultArgs)(parser, args);

        if (_lodash2['default'].size(showArgs)) {
          logNonDefaultArgsWarning(showArgs);
        }
        deprecatedArgs = (0, _config.getDeprecatedArgs)(parser, args);

        if (_lodash2['default'].size(deprecatedArgs)) {
          logDeprecationWarning(deprecatedArgs);
        }
        if (!_lodash2['default'].isEmpty(args.defaultCapabilities)) {
          logDefaultCapabilitiesWarning(args.defaultCapabilities);
        }
        // TODO: bring back loglevel reporting below once logger is flushed out
        //logger.info('Console LogLevel: ' + logger.transports.console.level);
        //if (logger.transports.file) {
        //logger.info('File LogLevel: ' + logger.transports.file.level);
        //}

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function logServerPort(address, port) {
  var logMessage = 'Appium REST http interface listener started on ' + (address + ':' + port);
  _logger2['default'].info(logMessage);
}

function initHeapdump(args) {
  if (args.heapdumpEnabled) {
    require('heapdump');
  }
}

function main() {
  var args = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var parser, throwInsteadOfExit, router, server;
  return _regeneratorRuntime.async(function main$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        parser = (0, _parser2['default'])();
        throwInsteadOfExit = false;

        if (args) {
          // a containing package passed in their own args, let's fill them out
          // with defaults
          args = _Object$assign({}, (0, _parser.getDefaultArgs)(), args);

          // if we have a containing package instead of running as a CLI process,
          // that package might not appreciate us calling 'process.exit' willy-
          // nilly, so give it the option to have us throw instead of exit
          if (args.throwInsteadOfExit) {
            throwInsteadOfExit = true;
            // but remove it since it's not a real server arg per se
            delete args.throwInsteadOfExit;
          }
        } else {
          // otherwise parse from CLI
          args = parser.parseArgs();
        }
        initHeapdump(args);
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap((0, _logsink.init)(args));

      case 6:
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(preflightChecks(parser, args, throwInsteadOfExit));

      case 8:
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(logStartupInfo(parser, args));

      case 10:
        router = (0, _appium2['default'])(args);
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap((0, _appiumBaseDriver.server)(router, args.port, args.address));

      case 13:
        server = context$1$0.sent;
        context$1$0.prev = 14;

        if (!(args.nodeconfig !== null)) {
          context$1$0.next = 18;
          break;
        }

        context$1$0.next = 18;
        return _regeneratorRuntime.awrap((0, _gridRegister2['default'])(args.nodeconfig, args.address, args.port));

      case 18:
        context$1$0.next = 25;
        break;

      case 20:
        context$1$0.prev = 20;
        context$1$0.t0 = context$1$0['catch'](14);
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap(server.close());

      case 24:
        throw context$1$0.t0;

      case 25:

        process.once('SIGINT', function callee$1$0() {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                _logger2['default'].info('Received SIGINT - shutting down');
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(server.close());

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, this);
        });

        process.once('SIGTERM', function callee$1$0() {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                _logger2['default'].info('Received SIGTERM - shutting down');
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(server.close());

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, this);
        });

        logServerPort(args.address, args.port);

        return context$1$0.abrupt('return', server);

      case 29:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[14, 20]]);
}

if (require.main === module) {
  (0, _asyncbox.asyncify)(main);
}

exports.main = main;

// TODO prelaunch if args.launch is set
// TODO: startAlertSocket(server, appiumServer);

// configure as node on grid, if necessary
//# sourceMappingURL=data:application/json;charset=utf8;base64,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SSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7eUNBR3hELE1BQU0sQ0FBQyxLQUFLLEVBQUU7Ozs7Ozs7QUFJdEIsZUFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Ozs7QUFDckIsb0NBQU8sSUFBSSxtQ0FBbUMsQ0FBQzs7aURBQ3pDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7Ozs7Ozs7U0FDckIsQ0FBQyxDQUFDOztBQUVILGVBQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFOzs7O0FBQ3RCLG9DQUFPLElBQUksb0NBQW9DLENBQUM7O2lEQUMxQyxNQUFNLENBQUMsS0FBSyxFQUFFOzs7Ozs7O1NBQ3JCLENBQUMsQ0FBQzs7QUFFSCxxQkFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzs0Q0FFaEMsTUFBTTs7Ozs7OztDQUNkOztBQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDM0IsMEJBQVMsSUFBSSxDQUFDLENBQUM7Q0FDaEI7O1FBRVEsSUFBSSxHQUFKLElBQUkiLCJmaWxlIjoibGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIHRyYW5zcGlsZTptYWluXG5cbmltcG9ydCB7IGluaXQgYXMgbG9nc2lua0luaXQgfSBmcm9tICcuL2xvZ3NpbmsnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7IC8vIGxvZ2dlciBuZWVkcyB0byByZW1haW4gZmlyc3Qgb2YgaW1wb3J0c1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHNlcnZlciBhcyBiYXNlU2VydmVyIH0gZnJvbSAnYXBwaXVtLWJhc2UtZHJpdmVyJztcbmltcG9ydCB7IGFzeW5jaWZ5IH0gZnJvbSAnYXN5bmNib3gnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBnZXRQYXJzZXIsIGdldERlZmF1bHRBcmdzIH0gZnJvbSAnLi9wYXJzZXInO1xuaW1wb3J0IHsgc2hvd0NvbmZpZywgY2hlY2tOb2RlT2ssIHZhbGlkYXRlU2VydmVyQXJncyxcbiAgICAgICAgIHdhcm5Ob2RlRGVwcmVjYXRpb25zLCB2YWxpZGF0ZVRtcERpciwgZ2V0Tm9uRGVmYXVsdEFyZ3MsXG4gICAgICAgICBnZXREZXByZWNhdGVkQXJncywgZ2V0R2l0UmV2LCBBUFBJVU1fVkVSIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGdldEFwcGl1bVJvdXRlciBmcm9tICcuL2FwcGl1bSc7XG5pbXBvcnQgcmVnaXN0ZXJOb2RlIGZyb20gJy4vZ3JpZC1yZWdpc3Rlcic7XG5pbXBvcnQgeyBpbnNwZWN0T2JqZWN0IH0gZnJvbSAnLi91dGlscyc7XG5cblxuYXN5bmMgZnVuY3Rpb24gcHJlZmxpZ2h0Q2hlY2tzIChwYXJzZXIsIGFyZ3MsIHRocm93SW5zdGVhZE9mRXhpdCA9IGZhbHNlKSB7XG4gIHRyeSB7XG4gICAgY2hlY2tOb2RlT2soKTtcbiAgICBpZiAoYXJncy5hc3luY1RyYWNlKSB7XG4gICAgICByZXF1aXJlKCdsb25nam9obicpLmFzeW5jX3RyYWNlX2xpbWl0ID0gLTE7XG4gICAgfVxuICAgIGlmIChhcmdzLnNob3dDb25maWcpIHtcbiAgICAgIGF3YWl0IHNob3dDb25maWcoKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9XG4gICAgd2Fybk5vZGVEZXByZWNhdGlvbnMoKTtcbiAgICB2YWxpZGF0ZVNlcnZlckFyZ3MocGFyc2VyLCBhcmdzKTtcbiAgICBpZiAoYXJncy50bXBEaXIpIHtcbiAgICAgIGF3YWl0IHZhbGlkYXRlVG1wRGlyKGFyZ3MudG1wRGlyKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZ2dlci5lcnJvcihlcnIubWVzc2FnZS5yZWQpO1xuICAgIGlmICh0aHJvd0luc3RlYWRPZkV4aXQpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG5cbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nRGVwcmVjYXRpb25XYXJuaW5nIChkZXByZWNhdGVkQXJncykge1xuICBsb2dnZXIud2FybignRGVwcmVjYXRlZCBzZXJ2ZXIgYXJnczonKTtcbiAgZm9yIChsZXQgW2FyZywgcmVhbEFyZ10gb2YgXy50b1BhaXJzKGRlcHJlY2F0ZWRBcmdzKSkge1xuICAgIGxvZ2dlci53YXJuKGAgICR7YXJnLnJlZH0gPT4gJHtyZWFsQXJnfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ05vbkRlZmF1bHRBcmdzV2FybmluZyAoYXJncykge1xuICBsb2dnZXIuaW5mbygnTm9uLWRlZmF1bHQgc2VydmVyIGFyZ3M6Jyk7XG4gIGluc3BlY3RPYmplY3QoYXJncyk7XG59XG5cbmZ1bmN0aW9uIGxvZ0RlZmF1bHRDYXBhYmlsaXRpZXNXYXJuaW5nIChjYXBzKSB7XG4gIGxvZ2dlci5pbmZvKCdEZWZhdWx0IGNhcGFiaWxpdGllcywgd2hpY2ggd2lsbCBiZSBhZGRlZCB0byBlYWNoIHJlcXVlc3QgJyArXG4gICAgICAgICAgICAgICd1bmxlc3Mgb3ZlcnJpZGRlbiBieSBkZXNpcmVkIGNhcGFiaWxpdGllczonKTtcbiAgaW5zcGVjdE9iamVjdChjYXBzKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9nU3RhcnR1cEluZm8gKHBhcnNlciwgYXJncykge1xuICBsZXQgd2VsY29tZSA9IGBXZWxjb21lIHRvIEFwcGl1bSB2JHtBUFBJVU1fVkVSfWA7XG4gIGxldCBhcHBpdW1SZXYgPSBhd2FpdCBnZXRHaXRSZXYoKTtcbiAgaWYgKGFwcGl1bVJldikge1xuICAgIHdlbGNvbWUgKz0gYCAoUkVWICR7YXBwaXVtUmV2fSlgO1xuICB9XG4gIGxvZ2dlci5pbmZvKHdlbGNvbWUpO1xuXG4gIGxldCBzaG93QXJncyA9IGdldE5vbkRlZmF1bHRBcmdzKHBhcnNlciwgYXJncyk7XG4gIGlmIChfLnNpemUoc2hvd0FyZ3MpKSB7XG4gICAgbG9nTm9uRGVmYXVsdEFyZ3NXYXJuaW5nKHNob3dBcmdzKTtcbiAgfVxuICBsZXQgZGVwcmVjYXRlZEFyZ3MgPSBnZXREZXByZWNhdGVkQXJncyhwYXJzZXIsIGFyZ3MpO1xuICBpZiAoXy5zaXplKGRlcHJlY2F0ZWRBcmdzKSkge1xuICAgIGxvZ0RlcHJlY2F0aW9uV2FybmluZyhkZXByZWNhdGVkQXJncyk7XG4gIH1cbiAgaWYgKCFfLmlzRW1wdHkoYXJncy5kZWZhdWx0Q2FwYWJpbGl0aWVzKSkge1xuICAgIGxvZ0RlZmF1bHRDYXBhYmlsaXRpZXNXYXJuaW5nKGFyZ3MuZGVmYXVsdENhcGFiaWxpdGllcyk7XG4gIH1cbiAgLy8gVE9ETzogYnJpbmcgYmFjayBsb2dsZXZlbCByZXBvcnRpbmcgYmVsb3cgb25jZSBsb2dnZXIgaXMgZmx1c2hlZCBvdXRcbiAgLy9sb2dnZXIuaW5mbygnQ29uc29sZSBMb2dMZXZlbDogJyArIGxvZ2dlci50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwpO1xuICAvL2lmIChsb2dnZXIudHJhbnNwb3J0cy5maWxlKSB7XG4gICAgLy9sb2dnZXIuaW5mbygnRmlsZSBMb2dMZXZlbDogJyArIGxvZ2dlci50cmFuc3BvcnRzLmZpbGUubGV2ZWwpO1xuICAvL31cbn1cblxuZnVuY3Rpb24gbG9nU2VydmVyUG9ydCAoYWRkcmVzcywgcG9ydCkge1xuICBsZXQgbG9nTWVzc2FnZSA9IGBBcHBpdW0gUkVTVCBodHRwIGludGVyZmFjZSBsaXN0ZW5lciBzdGFydGVkIG9uIGAgK1xuICAgICAgICAgICAgICAgICAgIGAke2FkZHJlc3N9OiR7cG9ydH1gO1xuICBsb2dnZXIuaW5mbyhsb2dNZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gaW5pdEhlYXBkdW1wIChhcmdzKSB7XG4gIGlmIChhcmdzLmhlYXBkdW1wRW5hYmxlZCkge1xuICAgIHJlcXVpcmUoJ2hlYXBkdW1wJyk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFpbiAoYXJncyA9IG51bGwpIHtcbiAgbGV0IHBhcnNlciA9IGdldFBhcnNlcigpO1xuICBsZXQgdGhyb3dJbnN0ZWFkT2ZFeGl0ID0gZmFsc2U7XG4gIGlmIChhcmdzKSB7XG4gICAgLy8gYSBjb250YWluaW5nIHBhY2thZ2UgcGFzc2VkIGluIHRoZWlyIG93biBhcmdzLCBsZXQncyBmaWxsIHRoZW0gb3V0XG4gICAgLy8gd2l0aCBkZWZhdWx0c1xuICAgIGFyZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBnZXREZWZhdWx0QXJncygpLCBhcmdzKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgYSBjb250YWluaW5nIHBhY2thZ2UgaW5zdGVhZCBvZiBydW5uaW5nIGFzIGEgQ0xJIHByb2Nlc3MsXG4gICAgLy8gdGhhdCBwYWNrYWdlIG1pZ2h0IG5vdCBhcHByZWNpYXRlIHVzIGNhbGxpbmcgJ3Byb2Nlc3MuZXhpdCcgd2lsbHktXG4gICAgLy8gbmlsbHksIHNvIGdpdmUgaXQgdGhlIG9wdGlvbiB0byBoYXZlIHVzIHRocm93IGluc3RlYWQgb2YgZXhpdFxuICAgIGlmIChhcmdzLnRocm93SW5zdGVhZE9mRXhpdCkge1xuICAgICAgdGhyb3dJbnN0ZWFkT2ZFeGl0ID0gdHJ1ZTtcbiAgICAgIC8vIGJ1dCByZW1vdmUgaXQgc2luY2UgaXQncyBub3QgYSByZWFsIHNlcnZlciBhcmcgcGVyIHNlXG4gICAgICBkZWxldGUgYXJncy50aHJvd0luc3RlYWRPZkV4aXQ7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIG90aGVyd2lzZSBwYXJzZSBmcm9tIENMSVxuICAgIGFyZ3MgPSBwYXJzZXIucGFyc2VBcmdzKCk7XG4gIH1cbiAgaW5pdEhlYXBkdW1wKGFyZ3MpO1xuICBhd2FpdCBsb2dzaW5rSW5pdChhcmdzKTtcbiAgYXdhaXQgcHJlZmxpZ2h0Q2hlY2tzKHBhcnNlciwgYXJncywgdGhyb3dJbnN0ZWFkT2ZFeGl0KTtcbiAgYXdhaXQgbG9nU3RhcnR1cEluZm8ocGFyc2VyLCBhcmdzKTtcbiAgbGV0IHJvdXRlciA9IGdldEFwcGl1bVJvdXRlcihhcmdzKTtcbiAgbGV0IHNlcnZlciA9IGF3YWl0IGJhc2VTZXJ2ZXIocm91dGVyLCBhcmdzLnBvcnQsIGFyZ3MuYWRkcmVzcyk7XG4gIHRyeSB7XG4gICAgLy8gVE9ETyBwcmVsYXVuY2ggaWYgYXJncy5sYXVuY2ggaXMgc2V0XG4gICAgLy8gVE9ETzogc3RhcnRBbGVydFNvY2tldChzZXJ2ZXIsIGFwcGl1bVNlcnZlcik7XG5cbiAgICAvLyBjb25maWd1cmUgYXMgbm9kZSBvbiBncmlkLCBpZiBuZWNlc3NhcnlcbiAgICBpZiAoYXJncy5ub2RlY29uZmlnICE9PSBudWxsKSB7XG4gICAgICBhd2FpdCByZWdpc3Rlck5vZGUoYXJncy5ub2RlY29uZmlnLCBhcmdzLmFkZHJlc3MsIGFyZ3MucG9ydCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBhd2FpdCBzZXJ2ZXIuY2xvc2UoKTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICBwcm9jZXNzLm9uY2UoJ1NJR0lOVCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBsb2dnZXIuaW5mbyhgUmVjZWl2ZWQgU0lHSU5UIC0gc2h1dHRpbmcgZG93bmApO1xuICAgIGF3YWl0IHNlcnZlci5jbG9zZSgpO1xuICB9KTtcblxuICBwcm9jZXNzLm9uY2UoJ1NJR1RFUk0nLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgbG9nZ2VyLmluZm8oYFJlY2VpdmVkIFNJR1RFUk0gLSBzaHV0dGluZyBkb3duYCk7XG4gICAgYXdhaXQgc2VydmVyLmNsb3NlKCk7XG4gIH0pO1xuXG4gIGxvZ1NlcnZlclBvcnQoYXJncy5hZGRyZXNzLCBhcmdzLnBvcnQpO1xuXG4gIHJldHVybiBzZXJ2ZXI7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBhc3luY2lmeShtYWluKTtcbn1cblxuZXhwb3J0IHsgbWFpbiB9O1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLiJ9
