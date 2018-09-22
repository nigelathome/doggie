'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _loggerJs = require('../logger.js');

var _loggerJs2 = _interopRequireDefault(_loggerJs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var PHONE_NUMBER_PATTERN = /^[\+]?[(]?[0-9]*[)]?[-\s\.]?[0-9]*[-\s\.]?[0-9]{2,}$/im;

var emuMethods = {};
emuMethods.POWER_AC_STATES = {
  POWER_AC_ON: 'on',
  POWER_AC_OFF: 'off'
};
emuMethods.GSM_CALL_ACTIONS = {
  GSM_CALL: 'call',
  GSM_ACCEPT: 'accept',
  GSM_CANCEL: 'cancel',
  GSM_HOLD: 'hold'
};
emuMethods.GSM_VOICE_STATES = {
  GSM_VOICE_UNREGISTERED: 'unregistered',
  GSM_VOICE_HOME: 'home',
  GSM_VOICE_ROAMING: 'roaming',
  GSM_VOICE_SEARCHING: 'searching',
  GSM_VOICE_DENIED: 'denied',
  GSM_VOICE_OFF: 'off',
  GSM_VOICE_ON: 'on'
};
emuMethods.GSM_SIGNAL_STRENGTHS = [0, 1, 2, 3, 4];

emuMethods.NETWORK_SPEED = {
  GSM: 'gsm', // GSM/CSD (up: 14.4, down: 14.4).
  SCSD: 'scsd', // HSCSD (up: 14.4, down: 57.6).
  GPRS: 'gprs', // GPRS (up: 28.8, down: 57.6).
  EDGE: 'edge', // EDGE/EGPRS (up: 473.6, down: 473.6).
  UMTS: 'umts', // UMTS/3G (up: 384.0, down: 384.0).
  HSDPA: 'hsdpa', // HSDPA (up: 5760.0, down: 13,980.0).
  LTE: 'lte', // LTE (up: 58,000, down: 173,000).
  EVDO: 'evdo', // EVDO (up: 75,000, down: 280,000).
  FULL: 'full' // No limit, the default (up: 0.0, down: 0.0).
};

/**
 * Check the emulator state.
 *
 * @return {boolean} True if Emulator is visible to adb.
 */
emuMethods.isEmulatorConnected = function callee$0$0() {
  var emulators;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.getConnectedEmulators());

      case 2:
        emulators = context$1$0.sent;
        return context$1$0.abrupt('return', !!_lodash2['default'].find(emulators, function (x) {
          return x && x.udid === _this.curDeviceId;
        }));

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Verify the emulator is connected.
 *
 * @throws {error} If Emulator is not visible to adb.
 */
emuMethods.verifyEmulatorConnected = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.isEmulatorConnected());

      case 2:
        if (context$1$0.sent) {
          context$1$0.next = 4;
          break;
        }

        _loggerJs2['default'].errorAndThrow('The emulator "' + this.curDeviceId + '" was unexpectedly disconnected');

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate fingerprint touch event on the connected emulator.
 *
 * @param {string} fingerprintId - The ID of the fingerprint.
 */
emuMethods.fingerprint = function callee$0$0(fingerprintId) {
  var level;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!fingerprintId) {
          _loggerJs2['default'].errorAndThrow('Fingerprint id parameter must be defined');
        }
        // the method used only works for API level 23 and above
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.getApiLevel());

      case 3:
        level = context$1$0.sent;

        if (level < 23) {
          _loggerJs2['default'].errorAndThrow('Device API Level must be >= 23. Current Api level \'' + level + '\'');
        }
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['finger', 'touch', fingerprintId]));

      case 7:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Change the display orientation on the connected emulator.
 * The orientation is changed (PI/2 is added) every time
 * this method is called.
 */
emuMethods.rotate = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['rotate']));

      case 2:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate power state change on the connected emulator.
 *
 * @param {string} state ['on'] - Either 'on' or 'off'.
 */
emuMethods.powerAC = function callee$0$0() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? 'on' : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_lodash2['default'].values(emuMethods.POWER_AC_STATES).indexOf(state) === -1) {
          _loggerJs2['default'].errorAndThrow('Wrong power AC state sent \'' + state + '\'. Supported values: ' + _lodash2['default'].values(emuMethods.POWER_AC_STATES) + ']');
        }
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['power', 'ac', state]));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate power capacity change on the connected emulator.
 *
 * @param {string|number} percent [100] - Percentage value in range [0, 100].
 */
emuMethods.powerCapacity = function callee$0$0() {
  var percent = arguments.length <= 0 || arguments[0] === undefined ? 100 : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        percent = parseInt(percent, 10);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          _loggerJs2['default'].errorAndThrow('The percentage value should be valid integer between 0 and 100');
        }
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['power', 'capacity', percent]));

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate power off event on the connected emulator.
 */
emuMethods.powerOFF = function callee$0$0() {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(this.powerAC(emuMethods.POWER_AC_STATES.POWER_AC_OFF));

      case 2:
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(this.powerCapacity(0));

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate send SMS event on the connected emulator.
 *
 * @param {string|number} phoneNumber - The phone number of message sender.
 * @param {string} message [''] - The message content.
 * @throws {error} If phone number has invalid format.
 */
emuMethods.sendSMS = function callee$0$0(phoneNumber) {
  var message = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        message = message.trim();
        if (message === "") {
          _loggerJs2['default'].errorAndThrow('Sending an SMS requires a message');
        }
        phoneNumber = ('' + phoneNumber).replace(/\s*/, "");
        if (!PHONE_NUMBER_PATTERN.test(phoneNumber)) {
          _loggerJs2['default'].errorAndThrow('Invalid sendSMS phoneNumber param ' + phoneNumber);
        }
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['sms', 'send', phoneNumber, message]));

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate GSM call event on the connected emulator.
 *
 * @param {string|number} phoneNumber - The phone number of the caller.
 * @param {string} action [''] - One of available GSM call actions.
 * @throws {error} If phone number has invalid format.
 * @throws {error} If _action_ value is invalid.
 */
emuMethods.gsmCall = function callee$0$0(phoneNumber) {
  var action = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_lodash2['default'].values(emuMethods.GSM_CALL_ACTIONS).indexOf(action) === -1) {
          _loggerJs2['default'].errorAndThrow('Invalid gsm action param ' + action + '. Supported values: ' + _lodash2['default'].values(emuMethods.GSM_CALL_ACTIONS));
        }
        phoneNumber = ('' + phoneNumber).replace(/\s*/, "");
        if (!PHONE_NUMBER_PATTERN.test(phoneNumber)) {
          _loggerJs2['default'].errorAndThrow('Invalid gsmCall phoneNumber param ' + phoneNumber);
        }
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['gsm', action, phoneNumber]));

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate GSM signal strength change event on the connected emulator.
 *
 * @param {string|number} strength [4] - A number in range [0, 4];
 * @throws {error} If _strength_ value is invalid.
 */
emuMethods.gsmSignal = function callee$0$0() {
  var strength = arguments.length <= 0 || arguments[0] === undefined ? 4 : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        strength = parseInt(strength, 10);
        if (emuMethods.GSM_SIGNAL_STRENGTHS.indexOf(strength) === -1) {
          _loggerJs2['default'].errorAndThrow('Invalid signal strength param ' + strength + '. Supported values: ' + _lodash2['default'].values(emuMethods.GSM_SIGNAL_STRENGTHS));
        }
        _loggerJs2['default'].info('gsm signal-profile <strength> changes the reported strength on next (15s) update.');
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['gsm', 'signal-profile', strength]));

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate GSM voice event on the connected emulator.
 *
 * @param {string} state ['on'] - Either 'on' or 'off'.
 * @throws {error} If _state_ value is invalid.
 */
emuMethods.gsmVoice = function callee$0$0() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? 'on' : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        // gsm voice <state> allows you to change the state of your GPRS connection
        if (_lodash2['default'].values(emuMethods.GSM_VOICE_STATES).indexOf(state) === -1) {
          _loggerJs2['default'].errorAndThrow('Invalid gsm voice state param ' + state + '. Supported values: ' + _lodash2['default'].values(emuMethods.GSM_VOICE_STATES));
        }
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['gsm', 'voice', state]));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Emulate network speed change event on the connected emulator.
 *
 * @param {string} speed ['full'] - One of possible NETWORK_SPEED values.
 * @throws {error} If _speed_ value is invalid.
 */
emuMethods.networkSpeed = function callee$0$0() {
  var speed = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        // network speed <speed> allows you to set the network speed emulation.
        if (_lodash2['default'].values(emuMethods.NETWORK_SPEED).indexOf(speed) === -1) {
          _loggerJs2['default'].errorAndThrow('Invalid network speed param ' + speed + '. Supported values: ' + _lodash2['default'].values(emuMethods.NETWORK_SPEED));
        }
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.adbExecEmu(['network', 'speed', speed]));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

exports['default'] = emuMethods;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90b29scy9hZGItZW11LWNvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7d0JBQWdCLGNBQWM7Ozs7c0JBQ2hCLFFBQVE7Ozs7QUFFdEIsSUFBTSxvQkFBb0IsR0FBRyx3REFBd0QsQ0FBQzs7QUFFdEYsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFVBQVUsQ0FBQyxlQUFlLEdBQUc7QUFDM0IsYUFBVyxFQUFFLElBQUk7QUFDakIsY0FBWSxFQUFFLEtBQUs7Q0FDcEIsQ0FBQztBQUNGLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRztBQUM1QixVQUFRLEVBQUcsTUFBTTtBQUNqQixZQUFVLEVBQUUsUUFBUTtBQUNwQixZQUFVLEVBQUUsUUFBUTtBQUNwQixVQUFRLEVBQUUsTUFBTTtDQUNqQixDQUFDO0FBQ0YsVUFBVSxDQUFDLGdCQUFnQixHQUFHO0FBQzVCLHdCQUFzQixFQUFFLGNBQWM7QUFDdEMsZ0JBQWMsRUFBRSxNQUFNO0FBQ3RCLG1CQUFpQixFQUFFLFNBQVM7QUFDNUIscUJBQW1CLEVBQUUsV0FBVztBQUNoQyxrQkFBZ0IsRUFBRSxRQUFRO0FBQzFCLGVBQWEsRUFBRSxLQUFLO0FBQ3BCLGNBQVksRUFBRSxJQUFJO0NBQ25CLENBQUM7QUFDRixVQUFVLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxELFVBQVUsQ0FBQyxhQUFhLEdBQUc7QUFDekIsS0FBRyxFQUFFLEtBQUs7QUFDVixNQUFJLEVBQUUsTUFBTTtBQUNaLE1BQUksRUFBRSxNQUFNO0FBQ1osTUFBSSxFQUFFLE1BQU07QUFDWixNQUFJLEVBQUUsTUFBTTtBQUNaLE9BQUssRUFBRSxPQUFPO0FBQ2QsS0FBRyxFQUFFLEtBQUs7QUFDVixNQUFJLEVBQUUsTUFBTTtBQUNaLE1BQUksRUFBRSxNQUFNO0NBQ2IsQ0FBQzs7Ozs7OztBQU9GLFVBQVUsQ0FBQyxtQkFBbUIsR0FBRztNQUMzQixTQUFTOzs7Ozs7O3lDQUFTLElBQUksQ0FBQyxxQkFBcUIsRUFBRTs7O0FBQTlDLGlCQUFTOzRDQUNOLENBQUMsQ0FBQyxvQkFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQztpQkFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFLLFdBQVc7U0FBQSxDQUFDOzs7Ozs7O0NBQ3BFLENBQUM7Ozs7Ozs7QUFPRixVQUFVLENBQUMsdUJBQXVCLEdBQUc7Ozs7O3lDQUN2QixJQUFJLENBQUMsbUJBQW1CLEVBQUU7Ozs7Ozs7O0FBQ3BDLDhCQUFJLGFBQWEsb0JBQWtCLElBQUksQ0FBQyxXQUFXLHFDQUFrQyxDQUFDOzs7Ozs7O0NBRXpGLENBQUM7Ozs7Ozs7QUFPRixVQUFVLENBQUMsV0FBVyxHQUFHLG9CQUFnQixhQUFhO01BS2hELEtBQUs7Ozs7QUFKVCxZQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGdDQUFJLGFBQWEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1NBQy9EOzs7eUNBRWlCLElBQUksQ0FBQyxXQUFXLEVBQUU7OztBQUFoQyxhQUFLOztBQUNULFlBQUksS0FBSyxHQUFHLEVBQUUsRUFBRTtBQUNkLGdDQUFJLGFBQWEsMERBQXVELEtBQUssUUFBSSxDQUFDO1NBQ25GOzt5Q0FDSyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzs7Ozs7OztDQUMxRCxDQUFDOzs7Ozs7O0FBT0YsVUFBVSxDQUFDLE1BQU0sR0FBRzs7Ozs7eUNBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7O0NBQ2xDLENBQUM7Ozs7Ozs7QUFPRixVQUFVLENBQUMsT0FBTyxHQUFHO01BQWdCLEtBQUsseURBQUcsSUFBSTs7OztBQUMvQyxZQUFJLG9CQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzlELGdDQUFJLGFBQWEsa0NBQStCLEtBQUssOEJBQXdCLG9CQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQUksQ0FBQztTQUN2SDs7eUNBQ0ssSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7Ozs7Q0FDOUMsQ0FBQzs7Ozs7OztBQU9GLFVBQVUsQ0FBQyxhQUFhLEdBQUc7TUFBZ0IsT0FBTyx5REFBRyxHQUFHOzs7O0FBQ3RELGVBQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFlBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLEdBQUcsRUFBRTtBQUNsRCxnQ0FBSSxhQUFhLGtFQUFrRSxDQUFDO1NBQ3JGOzt5Q0FDSyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQzs7Ozs7OztDQUN0RCxDQUFDOzs7OztBQUtGLFVBQVUsQ0FBQyxRQUFRLEdBQUc7Ozs7O3lDQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUM7Ozs7eUNBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0NBQzVCLENBQUM7Ozs7Ozs7OztBQVNGLFVBQVUsQ0FBQyxPQUFPLEdBQUcsb0JBQWdCLFdBQVc7TUFBRSxPQUFPLHlEQUFHLEVBQUU7Ozs7QUFDNUQsZUFBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QixZQUFJLE9BQU8sS0FBSyxFQUFFLEVBQUU7QUFDbEIsZ0NBQUksYUFBYSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7U0FDeEQ7QUFDRCxtQkFBVyxHQUFHLE1BQUcsV0FBVyxFQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDbEQsWUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUMzQyxnQ0FBSSxhQUFhLHdDQUFzQyxXQUFXLENBQUcsQ0FBQztTQUN2RTs7eUNBQ0ssSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7O0NBQzdELENBQUM7Ozs7Ozs7Ozs7QUFVRixVQUFVLENBQUMsT0FBTyxHQUFHLG9CQUFnQixXQUFXO01BQUUsTUFBTSx5REFBRyxFQUFFOzs7O0FBQzNELFlBQUksb0JBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNoRSxnQ0FBSSxhQUFhLCtCQUE2QixNQUFNLDRCQUF1QixvQkFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUcsQ0FBQztTQUNySDtBQUNELG1CQUFXLEdBQUcsTUFBRyxXQUFXLEVBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNsRCxZQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQzNDLGdDQUFJLGFBQWEsd0NBQXNDLFdBQVcsQ0FBRyxDQUFDO1NBQ3ZFOzt5Q0FDSyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzs7Ozs7OztDQUNwRCxDQUFDOzs7Ozs7OztBQVFGLFVBQVUsQ0FBQyxTQUFTLEdBQUc7TUFBZ0IsUUFBUSx5REFBRyxDQUFDOzs7O0FBQ2pELGdCQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNsQyxZQUFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDNUQsZ0NBQUksYUFBYSxvQ0FBa0MsUUFBUSw0QkFBdUIsb0JBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFHLENBQUM7U0FDaEk7QUFDRCw4QkFBSSxJQUFJLENBQUMsbUZBQW1GLENBQUMsQ0FBQzs7eUNBQ3hGLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7Ozs7Ozs7Q0FDM0QsQ0FBQzs7Ozs7Ozs7QUFRRixVQUFVLENBQUMsUUFBUSxHQUFHO01BQWdCLEtBQUsseURBQUcsSUFBSTs7Ozs7QUFFaEQsWUFBSSxvQkFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQy9ELGdDQUFJLGFBQWEsb0NBQWtDLEtBQUssNEJBQXVCLG9CQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBRyxDQUFDO1NBQ3pIOzt5Q0FDSyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzs7Ozs7OztDQUMvQyxDQUFDOzs7Ozs7OztBQVFGLFVBQVUsQ0FBQyxZQUFZLEdBQUc7TUFBZ0IsS0FBSyx5REFBRyxNQUFNOzs7OztBQUV0RCxZQUFJLG9CQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzVELGdDQUFJLGFBQWEsa0NBQWdDLEtBQUssNEJBQXVCLG9CQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUcsQ0FBQztTQUNwSDs7eUNBQ0ssSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7Ozs7Q0FDbkQsQ0FBQzs7cUJBRWEsVUFBVSIsImZpbGUiOiJsaWIvdG9vbHMvYWRiLWVtdS1jb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyLmpzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbmNvbnN0IFBIT05FX05VTUJFUl9QQVRURVJOID0gL15bXFwrXT9bKF0/WzAtOV0qWyldP1stXFxzXFwuXT9bMC05XSpbLVxcc1xcLl0/WzAtOV17Mix9JC9pbTtcblxubGV0IGVtdU1ldGhvZHMgPSB7fTtcbmVtdU1ldGhvZHMuUE9XRVJfQUNfU1RBVEVTID0ge1xuICBQT1dFUl9BQ19PTjogJ29uJyxcbiAgUE9XRVJfQUNfT0ZGOiAnb2ZmJ1xufTtcbmVtdU1ldGhvZHMuR1NNX0NBTExfQUNUSU9OUyA9IHtcbiAgR1NNX0NBTEwgOiAnY2FsbCcsXG4gIEdTTV9BQ0NFUFQ6ICdhY2NlcHQnLFxuICBHU01fQ0FOQ0VMOiAnY2FuY2VsJyxcbiAgR1NNX0hPTEQ6ICdob2xkJ1xufTtcbmVtdU1ldGhvZHMuR1NNX1ZPSUNFX1NUQVRFUyA9IHtcbiAgR1NNX1ZPSUNFX1VOUkVHSVNURVJFRDogJ3VucmVnaXN0ZXJlZCcsXG4gIEdTTV9WT0lDRV9IT01FOiAnaG9tZScsXG4gIEdTTV9WT0lDRV9ST0FNSU5HOiAncm9hbWluZycsXG4gIEdTTV9WT0lDRV9TRUFSQ0hJTkc6ICdzZWFyY2hpbmcnLFxuICBHU01fVk9JQ0VfREVOSUVEOiAnZGVuaWVkJyxcbiAgR1NNX1ZPSUNFX09GRjogJ29mZicsXG4gIEdTTV9WT0lDRV9PTjogJ29uJ1xufTtcbmVtdU1ldGhvZHMuR1NNX1NJR05BTF9TVFJFTkdUSFMgPSBbMCwgMSwgMiwgMywgNF07XG5cbmVtdU1ldGhvZHMuTkVUV09SS19TUEVFRCA9IHtcbiAgR1NNOiAnZ3NtJywgLy8gR1NNL0NTRCAodXA6IDE0LjQsIGRvd246IDE0LjQpLlxuICBTQ1NEOiAnc2NzZCcsIC8vIEhTQ1NEICh1cDogMTQuNCwgZG93bjogNTcuNikuXG4gIEdQUlM6ICdncHJzJywgLy8gR1BSUyAodXA6IDI4LjgsIGRvd246IDU3LjYpLlxuICBFREdFOiAnZWRnZScsIC8vIEVER0UvRUdQUlMgKHVwOiA0NzMuNiwgZG93bjogNDczLjYpLlxuICBVTVRTOiAndW10cycsIC8vIFVNVFMvM0cgKHVwOiAzODQuMCwgZG93bjogMzg0LjApLlxuICBIU0RQQTogJ2hzZHBhJywgLy8gSFNEUEEgKHVwOiA1NzYwLjAsIGRvd246IDEzLDk4MC4wKS5cbiAgTFRFOiAnbHRlJywgLy8gTFRFICh1cDogNTgsMDAwLCBkb3duOiAxNzMsMDAwKS5cbiAgRVZETzogJ2V2ZG8nLCAvLyBFVkRPICh1cDogNzUsMDAwLCBkb3duOiAyODAsMDAwKS5cbiAgRlVMTDogJ2Z1bGwnIC8vIE5vIGxpbWl0LCB0aGUgZGVmYXVsdCAodXA6IDAuMCwgZG93bjogMC4wKS5cbn07XG5cbi8qKlxuICogQ2hlY2sgdGhlIGVtdWxhdG9yIHN0YXRlLlxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgRW11bGF0b3IgaXMgdmlzaWJsZSB0byBhZGIuXG4gKi9cbmVtdU1ldGhvZHMuaXNFbXVsYXRvckNvbm5lY3RlZCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgbGV0IGVtdWxhdG9ycyA9IGF3YWl0IHRoaXMuZ2V0Q29ubmVjdGVkRW11bGF0b3JzKCk7XG4gIHJldHVybiAhIV8uZmluZChlbXVsYXRvcnMsICh4KSA9PiB4ICYmIHgudWRpZCA9PT0gdGhpcy5jdXJEZXZpY2VJZCk7XG59O1xuXG4vKipcbiAqIFZlcmlmeSB0aGUgZW11bGF0b3IgaXMgY29ubmVjdGVkLlxuICpcbiAqIEB0aHJvd3Mge2Vycm9yfSBJZiBFbXVsYXRvciBpcyBub3QgdmlzaWJsZSB0byBhZGIuXG4gKi9cbmVtdU1ldGhvZHMudmVyaWZ5RW11bGF0b3JDb25uZWN0ZWQgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gIGlmICghKGF3YWl0IHRoaXMuaXNFbXVsYXRvckNvbm5lY3RlZCgpKSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBUaGUgZW11bGF0b3IgXCIke3RoaXMuY3VyRGV2aWNlSWR9XCIgd2FzIHVuZXhwZWN0ZWRseSBkaXNjb25uZWN0ZWRgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBFbXVsYXRlIGZpbmdlcnByaW50IHRvdWNoIGV2ZW50IG9uIHRoZSBjb25uZWN0ZWQgZW11bGF0b3IuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbmdlcnByaW50SWQgLSBUaGUgSUQgb2YgdGhlIGZpbmdlcnByaW50LlxuICovXG5lbXVNZXRob2RzLmZpbmdlcnByaW50ID0gYXN5bmMgZnVuY3Rpb24gKGZpbmdlcnByaW50SWQpIHtcbiAgaWYgKCFmaW5nZXJwcmludElkKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coJ0ZpbmdlcnByaW50IGlkIHBhcmFtZXRlciBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyB0aGUgbWV0aG9kIHVzZWQgb25seSB3b3JrcyBmb3IgQVBJIGxldmVsIDIzIGFuZCBhYm92ZVxuICBsZXQgbGV2ZWwgPSBhd2FpdCB0aGlzLmdldEFwaUxldmVsKCk7XG4gIGlmIChsZXZlbCA8IDIzKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYERldmljZSBBUEkgTGV2ZWwgbXVzdCBiZSA+PSAyMy4gQ3VycmVudCBBcGkgbGV2ZWwgJyR7bGV2ZWx9J2ApO1xuICB9XG4gIGF3YWl0IHRoaXMuYWRiRXhlY0VtdShbJ2ZpbmdlcicsICd0b3VjaCcsIGZpbmdlcnByaW50SWRdKTtcbn07XG5cbi8qKlxuICogQ2hhbmdlIHRoZSBkaXNwbGF5IG9yaWVudGF0aW9uIG9uIHRoZSBjb25uZWN0ZWQgZW11bGF0b3IuXG4gKiBUaGUgb3JpZW50YXRpb24gaXMgY2hhbmdlZCAoUEkvMiBpcyBhZGRlZCkgZXZlcnkgdGltZVxuICogdGhpcyBtZXRob2QgaXMgY2FsbGVkLlxuICovXG5lbXVNZXRob2RzLnJvdGF0ZSA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgYXdhaXQgdGhpcy5hZGJFeGVjRW11KFsncm90YXRlJ10pO1xufTtcblxuLyoqXG4gKiBFbXVsYXRlIHBvd2VyIHN0YXRlIGNoYW5nZSBvbiB0aGUgY29ubmVjdGVkIGVtdWxhdG9yLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSBbJ29uJ10gLSBFaXRoZXIgJ29uJyBvciAnb2ZmJy5cbiAqL1xuZW11TWV0aG9kcy5wb3dlckFDID0gYXN5bmMgZnVuY3Rpb24gKHN0YXRlID0gJ29uJykge1xuICBpZiAoXy52YWx1ZXMoZW11TWV0aG9kcy5QT1dFUl9BQ19TVEFURVMpLmluZGV4T2Yoc3RhdGUpID09PSAtMSkge1xuICAgIGxvZy5lcnJvckFuZFRocm93KGBXcm9uZyBwb3dlciBBQyBzdGF0ZSBzZW50ICcke3N0YXRlfScuIFN1cHBvcnRlZCB2YWx1ZXM6ICR7Xy52YWx1ZXMoZW11TWV0aG9kcy5QT1dFUl9BQ19TVEFURVMpfV1gKTtcbiAgfVxuICBhd2FpdCB0aGlzLmFkYkV4ZWNFbXUoWydwb3dlcicsICdhYycsIHN0YXRlXSk7XG59O1xuXG4vKipcbiAqIEVtdWxhdGUgcG93ZXIgY2FwYWNpdHkgY2hhbmdlIG9uIHRoZSBjb25uZWN0ZWQgZW11bGF0b3IuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBwZXJjZW50IFsxMDBdIC0gUGVyY2VudGFnZSB2YWx1ZSBpbiByYW5nZSBbMCwgMTAwXS5cbiAqL1xuZW11TWV0aG9kcy5wb3dlckNhcGFjaXR5ID0gYXN5bmMgZnVuY3Rpb24gKHBlcmNlbnQgPSAxMDApIHtcbiAgcGVyY2VudCA9IHBhcnNlSW50KHBlcmNlbnQsIDEwKTtcbiAgaWYgKGlzTmFOKHBlcmNlbnQpIHx8IHBlcmNlbnQgPCAwIHx8IHBlcmNlbnQgPiAxMDApIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgVGhlIHBlcmNlbnRhZ2UgdmFsdWUgc2hvdWxkIGJlIHZhbGlkIGludGVnZXIgYmV0d2VlbiAwIGFuZCAxMDBgKTtcbiAgfVxuICBhd2FpdCB0aGlzLmFkYkV4ZWNFbXUoWydwb3dlcicsICdjYXBhY2l0eScsIHBlcmNlbnRdKTtcbn07XG5cbi8qKlxuICogRW11bGF0ZSBwb3dlciBvZmYgZXZlbnQgb24gdGhlIGNvbm5lY3RlZCBlbXVsYXRvci5cbiAqL1xuZW11TWV0aG9kcy5wb3dlck9GRiA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgYXdhaXQgdGhpcy5wb3dlckFDKGVtdU1ldGhvZHMuUE9XRVJfQUNfU1RBVEVTLlBPV0VSX0FDX09GRik7XG4gIGF3YWl0IHRoaXMucG93ZXJDYXBhY2l0eSgwKTtcbn07XG5cbi8qKlxuICogRW11bGF0ZSBzZW5kIFNNUyBldmVudCBvbiB0aGUgY29ubmVjdGVkIGVtdWxhdG9yLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gcGhvbmVOdW1iZXIgLSBUaGUgcGhvbmUgbnVtYmVyIG9mIG1lc3NhZ2Ugc2VuZGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgWycnXSAtIFRoZSBtZXNzYWdlIGNvbnRlbnQuXG4gKiBAdGhyb3dzIHtlcnJvcn0gSWYgcGhvbmUgbnVtYmVyIGhhcyBpbnZhbGlkIGZvcm1hdC5cbiAqL1xuZW11TWV0aG9kcy5zZW5kU01TID0gYXN5bmMgZnVuY3Rpb24gKHBob25lTnVtYmVyLCBtZXNzYWdlID0gJycpIHtcbiAgbWVzc2FnZSA9IG1lc3NhZ2UudHJpbSgpO1xuICBpZiAobWVzc2FnZSA9PT0gXCJcIikge1xuICAgIGxvZy5lcnJvckFuZFRocm93KCdTZW5kaW5nIGFuIFNNUyByZXF1aXJlcyBhIG1lc3NhZ2UnKTtcbiAgfVxuICBwaG9uZU51bWJlciA9IGAke3Bob25lTnVtYmVyfWAucmVwbGFjZSgvXFxzKi8sIFwiXCIpO1xuICBpZiAoIVBIT05FX05VTUJFUl9QQVRURVJOLnRlc3QocGhvbmVOdW1iZXIpKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYEludmFsaWQgc2VuZFNNUyBwaG9uZU51bWJlciBwYXJhbSAke3Bob25lTnVtYmVyfWApO1xuICB9XG4gIGF3YWl0IHRoaXMuYWRiRXhlY0VtdShbJ3NtcycsICdzZW5kJywgcGhvbmVOdW1iZXIsIG1lc3NhZ2VdKTtcbn07XG5cbi8qKlxuICogRW11bGF0ZSBHU00gY2FsbCBldmVudCBvbiB0aGUgY29ubmVjdGVkIGVtdWxhdG9yLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gcGhvbmVOdW1iZXIgLSBUaGUgcGhvbmUgbnVtYmVyIG9mIHRoZSBjYWxsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uIFsnJ10gLSBPbmUgb2YgYXZhaWxhYmxlIEdTTSBjYWxsIGFjdGlvbnMuXG4gKiBAdGhyb3dzIHtlcnJvcn0gSWYgcGhvbmUgbnVtYmVyIGhhcyBpbnZhbGlkIGZvcm1hdC5cbiAqIEB0aHJvd3Mge2Vycm9yfSBJZiBfYWN0aW9uXyB2YWx1ZSBpcyBpbnZhbGlkLlxuICovXG5lbXVNZXRob2RzLmdzbUNhbGwgPSBhc3luYyBmdW5jdGlvbiAocGhvbmVOdW1iZXIsIGFjdGlvbiA9ICcnKSB7XG4gIGlmIChfLnZhbHVlcyhlbXVNZXRob2RzLkdTTV9DQUxMX0FDVElPTlMpLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgSW52YWxpZCBnc20gYWN0aW9uIHBhcmFtICR7YWN0aW9ufS4gU3VwcG9ydGVkIHZhbHVlczogJHtfLnZhbHVlcyhlbXVNZXRob2RzLkdTTV9DQUxMX0FDVElPTlMpfWApO1xuICB9XG4gIHBob25lTnVtYmVyID0gYCR7cGhvbmVOdW1iZXJ9YC5yZXBsYWNlKC9cXHMqLywgXCJcIik7XG4gIGlmICghUEhPTkVfTlVNQkVSX1BBVFRFUk4udGVzdChwaG9uZU51bWJlcikpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgSW52YWxpZCBnc21DYWxsIHBob25lTnVtYmVyIHBhcmFtICR7cGhvbmVOdW1iZXJ9YCk7XG4gIH1cbiAgYXdhaXQgdGhpcy5hZGJFeGVjRW11KFsnZ3NtJywgYWN0aW9uLCBwaG9uZU51bWJlcl0pO1xufTtcblxuLyoqXG4gKiBFbXVsYXRlIEdTTSBzaWduYWwgc3RyZW5ndGggY2hhbmdlIGV2ZW50IG9uIHRoZSBjb25uZWN0ZWQgZW11bGF0b3IuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBzdHJlbmd0aCBbNF0gLSBBIG51bWJlciBpbiByYW5nZSBbMCwgNF07XG4gKiBAdGhyb3dzIHtlcnJvcn0gSWYgX3N0cmVuZ3RoXyB2YWx1ZSBpcyBpbnZhbGlkLlxuICovXG5lbXVNZXRob2RzLmdzbVNpZ25hbCA9IGFzeW5jIGZ1bmN0aW9uIChzdHJlbmd0aCA9IDQpIHtcbiAgc3RyZW5ndGggPSBwYXJzZUludChzdHJlbmd0aCwgMTApO1xuICBpZiAoZW11TWV0aG9kcy5HU01fU0lHTkFMX1NUUkVOR1RIUy5pbmRleE9mKHN0cmVuZ3RoKSA9PT0gLTEpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgSW52YWxpZCBzaWduYWwgc3RyZW5ndGggcGFyYW0gJHtzdHJlbmd0aH0uIFN1cHBvcnRlZCB2YWx1ZXM6ICR7Xy52YWx1ZXMoZW11TWV0aG9kcy5HU01fU0lHTkFMX1NUUkVOR1RIUyl9YCk7XG4gIH1cbiAgbG9nLmluZm8oJ2dzbSBzaWduYWwtcHJvZmlsZSA8c3RyZW5ndGg+IGNoYW5nZXMgdGhlIHJlcG9ydGVkIHN0cmVuZ3RoIG9uIG5leHQgKDE1cykgdXBkYXRlLicpO1xuICBhd2FpdCB0aGlzLmFkYkV4ZWNFbXUoWydnc20nLCAnc2lnbmFsLXByb2ZpbGUnLCBzdHJlbmd0aF0pO1xufTtcblxuLyoqXG4gKiBFbXVsYXRlIEdTTSB2b2ljZSBldmVudCBvbiB0aGUgY29ubmVjdGVkIGVtdWxhdG9yLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSBbJ29uJ10gLSBFaXRoZXIgJ29uJyBvciAnb2ZmJy5cbiAqIEB0aHJvd3Mge2Vycm9yfSBJZiBfc3RhdGVfIHZhbHVlIGlzIGludmFsaWQuXG4gKi9cbmVtdU1ldGhvZHMuZ3NtVm9pY2UgPSBhc3luYyBmdW5jdGlvbiAoc3RhdGUgPSAnb24nKSB7XG4gIC8vIGdzbSB2b2ljZSA8c3RhdGU+IGFsbG93cyB5b3UgdG8gY2hhbmdlIHRoZSBzdGF0ZSBvZiB5b3VyIEdQUlMgY29ubmVjdGlvblxuICBpZiAoXy52YWx1ZXMoZW11TWV0aG9kcy5HU01fVk9JQ0VfU1RBVEVTKS5pbmRleE9mKHN0YXRlKSA9PT0gLTEpIHtcbiAgICBsb2cuZXJyb3JBbmRUaHJvdyhgSW52YWxpZCBnc20gdm9pY2Ugc3RhdGUgcGFyYW0gJHtzdGF0ZX0uIFN1cHBvcnRlZCB2YWx1ZXM6ICR7Xy52YWx1ZXMoZW11TWV0aG9kcy5HU01fVk9JQ0VfU1RBVEVTKX1gKTtcbiAgfVxuICBhd2FpdCB0aGlzLmFkYkV4ZWNFbXUoWydnc20nLCAndm9pY2UnLCBzdGF0ZV0pO1xufTtcblxuLyoqXG4gKiBFbXVsYXRlIG5ldHdvcmsgc3BlZWQgY2hhbmdlIGV2ZW50IG9uIHRoZSBjb25uZWN0ZWQgZW11bGF0b3IuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNwZWVkIFsnZnVsbCddIC0gT25lIG9mIHBvc3NpYmxlIE5FVFdPUktfU1BFRUQgdmFsdWVzLlxuICogQHRocm93cyB7ZXJyb3J9IElmIF9zcGVlZF8gdmFsdWUgaXMgaW52YWxpZC5cbiAqL1xuZW11TWV0aG9kcy5uZXR3b3JrU3BlZWQgPSBhc3luYyBmdW5jdGlvbiAoc3BlZWQgPSAnZnVsbCcpIHtcbiAgLy8gbmV0d29yayBzcGVlZCA8c3BlZWQ+IGFsbG93cyB5b3UgdG8gc2V0IHRoZSBuZXR3b3JrIHNwZWVkIGVtdWxhdGlvbi5cbiAgaWYgKF8udmFsdWVzKGVtdU1ldGhvZHMuTkVUV09SS19TUEVFRCkuaW5kZXhPZihzcGVlZCkgPT09IC0xKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYEludmFsaWQgbmV0d29yayBzcGVlZCBwYXJhbSAke3NwZWVkfS4gU3VwcG9ydGVkIHZhbHVlczogJHtfLnZhbHVlcyhlbXVNZXRob2RzLk5FVFdPUktfU1BFRUQpfWApO1xuICB9XG4gIGF3YWl0IHRoaXMuYWRiRXhlY0VtdShbJ25ldHdvcmsnLCAnc3BlZWQnLCBzcGVlZF0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZW11TWV0aG9kcztcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
