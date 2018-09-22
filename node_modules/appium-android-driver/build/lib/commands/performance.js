'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Number$isNaN = require('babel-runtime/core-js/number/is-nan')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _asyncbox = require('asyncbox');

var commands = {},
    helpers = {},
    extensions = {};

var NETWORK_KEYS = [['bucketStart', 'activeTime', 'rxBytes', 'rxPackets', 'txBytes', 'txPackets', 'operations', 'bucketDuration'], ['st', 'activeTime', 'rb', 'rp', 'tb', 'tp', 'op', 'bucketDuration']];
var CPU_KEYS = ['user', 'kernel'];
var BATTERY_KEYS = ['power'];
var MEMORY_KEYS = ['totalPrivateDirty', 'nativePrivateDirty', 'dalvikPrivateDirty', 'eglPrivateDirty', 'glPrivateDirty', 'totalPss', 'nativePss', 'dalvikPss', 'eglPss', 'glPss', 'nativeHeapAllocatedSize', 'nativeHeapSize'];

var SUPPORTED_PERFORMANCE_DATA_TYPES = {
  cpuinfo: 'the amount of cpu by user and kernel process - cpu information for applications on real devices and simulators',
  memoryinfo: 'the amount of memory used by the process - memory information for applications on real devices and simulators',
  batteryinfo: 'the remaining battery power - battery power information for applications on real devices and simulators',
  networkinfo: 'the network statistics - network rx/tx information for applications on real devices and simulators'
};

var RETRY_PAUSE = 1000;

//
// returns the information type of the system state which is supported to read as like cpu, memory, network traffic, and battery.
// output - array like below
//[cpuinfo, batteryinfo, networkinfo, memoryinfo]
//
commands.getPerformanceDataTypes = function () {
  return _lodash2['default'].keys(SUPPORTED_PERFORMANCE_DATA_TYPES);
};

// returns the information type of the system state which is supported to read as like cpu, memory, network traffic, and battery.
//input - (packageName) the package name of the application
//        (dataType) the type of system state which wants to read. It should be one of the keys of the SUPPORTED_PERFORMANCE_DATA_TYPES
//        (dataReadTimeout) the number of attempts to read
// output - table of the performance data, The first line of the table represents the type of data. The remaining lines represent the values of the data.
//
// in case of battery info : [[power], [23]]
// in case of memory info :  [[totalPrivateDirty, nativePrivateDirty, dalvikPrivateDirty, eglPrivateDirty, glPrivateDirty, totalPss, nativePss, dalvikPss, eglPss, glPss, nativeHeapAllocatedSize, nativeHeapSize], [18360, 8296, 6132, null, null, 42588, 8406, 7024, null, null, 26519, 10344]]
// in case of network info : [[bucketStart, activeTime, rxBytes, rxPackets, txBytes, txPackets, operations, bucketDuration,], [1478091600000, null, 1099075, 610947, 928, 114362, 769, 0, 3600000], [1478095200000, null, 1306300, 405997, 509, 46359, 370, 0, 3600000]]
// in case of network info : [[st, activeTime, rb, rp, tb, tp, op, bucketDuration], [1478088000, null, null, 32115296, 34291, 2956805, 25705, 0, 3600], [1478091600, null, null, 2714683, 11821, 1420564, 12650, 0, 3600], [1478095200, null, null, 10079213, 19962, 2487705, 20015, 0, 3600], [1478098800, null, null, 4444433, 10227, 1430356, 10493, 0, 3600]]
// in case of cpu info : [[user, kernel], [0.9, 1.3]]
//
commands.getPerformanceData = function callee$0$0(packageName, dataType) {
  var dataReadTimeout = arguments.length <= 2 || arguments[2] === undefined ? 2 : arguments[2];
  var data;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        data = undefined;
        context$1$0.t0 = dataType;
        context$1$0.next = context$1$0.t0 === 'batteryinfo' ? 4 : context$1$0.t0 === 'cpuinfo' ? 8 : context$1$0.t0 === 'memoryinfo' ? 12 : context$1$0.t0 === 'networkinfo' ? 16 : 20;
        break;

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(this.getBatteryInfo(dataReadTimeout));

      case 6:
        data = context$1$0.sent;
        return context$1$0.abrupt('break', 21);

      case 8:
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(this.getCPUInfo(packageName, dataReadTimeout));

      case 10:
        data = context$1$0.sent;
        return context$1$0.abrupt('break', 21);

      case 12:
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(this.getMemoryInfo(packageName, dataReadTimeout));

      case 14:
        data = context$1$0.sent;
        return context$1$0.abrupt('break', 21);

      case 16:
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(this.getNetworkTrafficInfo(dataReadTimeout));

      case 18:
        data = context$1$0.sent;
        return context$1$0.abrupt('break', 21);

      case 20:
        throw new Error('No performance data of type \'' + dataType + '\' found.');

      case 21:
        return context$1$0.abrupt('return', data);

      case 22:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.getCPUInfo = function callee$0$0(packageName) {
  var dataReadTimeout = arguments.length <= 1 || arguments[1] === undefined ? 2 : arguments[1];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(dataReadTimeout, RETRY_PAUSE, function callee$1$0() {
          var cmd, data, match, user, kernel;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                cmd = ['dumpsys', 'cpuinfo', '|', 'grep', '\'' + packageName + '\''];
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(this.adb.shell(cmd));

              case 3:
                data = context$2$0.sent;

                if (data) {
                  context$2$0.next = 6;
                  break;
                }

                throw new Error('No data from dumpsys');

              case 6:
                match = /(\d+)% user \+ (\d+)% kernel/.exec(data);

                if (match) {
                  context$2$0.next = 9;
                  break;
                }

                throw new Error('Unable to parse cpu data: \'' + data + '\'');

              case 9:
                user = match[1];
                kernel = match[2];
                return context$2$0.abrupt('return', [_lodash2['default'].clone(CPU_KEYS), [user, kernel]]);

              case 12:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        }));

      case 2:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.getBatteryInfo = function callee$0$0() {
  var dataReadTimeout = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this2 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(dataReadTimeout, RETRY_PAUSE, function callee$1$0() {
          var cmd, data, power;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                cmd = ['dumpsys', 'battery', '|', 'grep', 'level'];
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(this.adb.shell(cmd));

              case 3:
                data = context$2$0.sent;

                if (data) {
                  context$2$0.next = 6;
                  break;
                }

                throw new Error('No data from dumpsys');

              case 6:
                power = parseInt((data.split(':')[1] || '').trim(), 10);

                if (_Number$isNaN(power)) {
                  context$2$0.next = 11;
                  break;
                }

                return context$2$0.abrupt('return', [_lodash2['default'].clone(BATTERY_KEYS), [power.toString()]]);

              case 11:
                throw new Error('Unable to parse battery data: \'' + data + '\'');

              case 12:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this2);
        }));

      case 2:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.getMemoryInfo = function callee$0$0(packageName) {
  var dataReadTimeout = arguments.length <= 1 || arguments[1] === undefined ? 2 : arguments[1];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this3 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(dataReadTimeout, RETRY_PAUSE, function callee$1$0() {
          var cmd, data, totalPrivateDirty, totalPss, nativePrivateDirty, nativePss, nativeHeapSize, nativeHeapAllocatedSize, dalvikPrivateDirty, dalvikPss, eglPrivateDirty, eglPss, glPrivateDirty, glPss, apilevel, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line, entries, type, subType, headers, _data;

          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                cmd = ['dumpsys', 'meminfo', '\'' + packageName + '\'', '|', 'grep', '-E', "'Native|Dalvik|EGL|GL|TOTAL'"];
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(this.adb.shell(cmd));

              case 3:
                data = context$2$0.sent;

                if (data) {
                  context$2$0.next = 6;
                  break;
                }

                throw new Error('No data from dumpsys');

              case 6:
                totalPrivateDirty = undefined, totalPss = undefined, nativePrivateDirty = undefined, nativePss = undefined, nativeHeapSize = undefined, nativeHeapAllocatedSize = undefined, dalvikPrivateDirty = undefined, dalvikPss = undefined, eglPrivateDirty = undefined, eglPss = undefined, glPrivateDirty = undefined, glPss = undefined;
                context$2$0.next = 9;
                return _regeneratorRuntime.awrap(this.adb.getApiLevel());

              case 9:
                apilevel = context$2$0.sent;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                context$2$0.prev = 13;

                for (_iterator = _getIterator(data.split('\n')); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  line = _step.value;
                  entries = line.trim().split(' ').filter(Boolean);

                  // entries will have the values
                  //   ['<System Type>', '<Memory Type>', <pss total>, <private dirty>, <private clean>, <swapPss dirty>, <heap size>, <heap alloc>, <heap free>]
                  // except 'TOTAL', which skips the second type name
                  //
                  // and on API level 18 and below
                  //   ['<System Type', '<pps>', '<shared dirty>', '<private dirty>', '<heap size>', '<heap alloc>', '<heap free>']

                  if (apilevel > 18) {
                    type = entries[0];
                    subType = entries[1];

                    if (type === 'Native' && subType === 'Heap') {
                      // native heap
                      nativePss = entries[2];
                      nativePrivateDirty = entries[3];
                      nativeHeapSize = entries[6];
                      nativeHeapAllocatedSize = entries[7];
                    } else if (type === 'Dalvik' && subType === 'Heap') {
                      // dalvik heap
                      dalvikPss = entries[2];
                      dalvikPrivateDirty = entries[3];
                    } else if (type === 'EGL' && subType === 'mtrack') {
                      // egl
                      eglPss = entries[2];
                      eglPrivateDirty = entries[3];
                    } else if (type === 'GL' && subType === 'mtrack') {
                      // gl
                      glPss = entries[2];
                      glPrivateDirty = entries[3];
                    } else if (type === 'TOTAL' && entries.length === 8) {
                      // there are two totals, and we only want the full listing, which has 8 entries
                      totalPss = entries[1];
                      totalPrivateDirty = entries[2];
                    }
                  } else {
                    type = entries[0];

                    if (type === 'Native') {
                      nativePss = entries[1];
                      nativePrivateDirty = entries[3];
                      nativeHeapSize = entries[4];
                      nativeHeapAllocatedSize = entries[5];
                    } else if (type === 'Dalvik') {
                      dalvikPss = entries[1];
                      dalvikPrivateDirty = entries[3];
                    } else if (type === 'EGL') {
                      eglPss = entries[1];
                      eglPrivateDirty = entries[3];
                    } else if (type === 'GL') {
                      glPss = entries[1];
                      glPrivateDirty = entries[3];
                    } else if (type === 'TOTAL') {
                      totalPss = entries[1];
                      totalPrivateDirty = entries[3];
                    }
                  }
                }

                context$2$0.next = 21;
                break;

              case 17:
                context$2$0.prev = 17;
                context$2$0.t0 = context$2$0['catch'](13);
                _didIteratorError = true;
                _iteratorError = context$2$0.t0;

              case 21:
                context$2$0.prev = 21;
                context$2$0.prev = 22;

                if (!_iteratorNormalCompletion && _iterator['return']) {
                  _iterator['return']();
                }

              case 24:
                context$2$0.prev = 24;

                if (!_didIteratorError) {
                  context$2$0.next = 27;
                  break;
                }

                throw _iteratorError;

              case 27:
                return context$2$0.finish(24);

              case 28:
                return context$2$0.finish(21);

              case 29:
                if (!(totalPrivateDirty && totalPrivateDirty !== 'nodex')) {
                  context$2$0.next = 35;
                  break;
                }

                headers = _lodash2['default'].clone(MEMORY_KEYS);
                _data = [totalPrivateDirty, nativePrivateDirty, dalvikPrivateDirty, eglPrivateDirty, glPrivateDirty, totalPss, nativePss, dalvikPss, eglPss, glPss, nativeHeapAllocatedSize, nativeHeapSize];
                return context$2$0.abrupt('return', [headers, _data]);

              case 35:
                throw new Error('Unable to parse memory data: \'' + data + '\'');

              case 36:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this3, [[13, 17, 21, 29], [22,, 24, 28]]);
        }));

      case 2:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

helpers.getNetworkTrafficInfo = function callee$0$0() {
  var dataReadTimeout = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this4 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(dataReadTimeout, RETRY_PAUSE, function callee$1$0() {
          var returnValue, bucketDuration, bucketStart, activeTime, rxBytes, rxPackets, txBytes, txPackets, operations, cmd, data, index, fromXtstats, start, delimiter, end, pendingBytes, arrayList, j, k, returnIndex, i;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                returnValue = [];
                bucketDuration = undefined, bucketStart = undefined, activeTime = undefined, rxBytes = undefined, rxPackets = undefined, txBytes = undefined, txPackets = undefined, operations = undefined;
                cmd = ['dumpsys', 'netstats'];
                context$2$0.next = 5;
                return _regeneratorRuntime.awrap(this.adb.shell(cmd));

              case 5:
                data = context$2$0.sent;

                if (data) {
                  context$2$0.next = 8;
                  break;
                }

                throw new Error('No data from dumpsys');

              case 8:
                index = 0;
                fromXtstats = data.indexOf("Xt stats:");
                start = data.indexOf("Pending bytes:", fromXtstats);
                delimiter = data.indexOf(":", start + 1);
                end = data.indexOf("\n", delimiter + 1);
                pendingBytes = data.substring(delimiter + 1, end).trim();

                if (end > delimiter) {
                  start = data.indexOf("bucketDuration", end + 1);
                  delimiter = data.indexOf("=", start + 1);
                  end = data.indexOf("\n", delimiter + 1);
                  bucketDuration = data.substring(delimiter + 1, end).trim();
                }

                if (!(start >= 0)) {
                  context$2$0.next = 33;
                  break;
                }

                data = data.substring(end + 1, data.length);
                arrayList = data.split("\n");

                if (!(arrayList.length > 0)) {
                  context$2$0.next = 33;
                  break;
                }

                start = -1;

                j = 0;

              case 21:
                if (!(j < NETWORK_KEYS.length)) {
                  context$2$0.next = 31;
                  break;
                }

                start = arrayList[0].indexOf(NETWORK_KEYS[j][0]);

                if (!(start >= 0)) {
                  context$2$0.next = 28;
                  break;
                }

                index = j;
                returnValue[0] = [];

                for (k = 0; k < NETWORK_KEYS[j].length; ++k) {
                  returnValue[0][k] = NETWORK_KEYS[j][k];
                }
                return context$2$0.abrupt('break', 31);

              case 28:
                ++j;
                context$2$0.next = 21;
                break;

              case 31:
                returnIndex = 1;

                for (i = 0; i < arrayList.length; i++) {
                  data = arrayList[i];
                  start = data.indexOf(NETWORK_KEYS[index][0]);

                  if (start >= 0) {
                    delimiter = data.indexOf("=", start + 1);
                    end = data.indexOf(" ", delimiter + 1);
                    bucketStart = data.substring(delimiter + 1, end).trim();

                    if (end > delimiter) {
                      start = data.indexOf(NETWORK_KEYS[index][1], end + 1);
                      if (start >= 0) {
                        delimiter = data.indexOf("=", start + 1);
                        end = data.indexOf(" ", delimiter + 1);
                        activeTime = data.substring(delimiter + 1, end).trim();
                      }
                    }

                    if (end > delimiter) {
                      start = data.indexOf(NETWORK_KEYS[index][2], end + 1);
                      if (start >= 0) {
                        delimiter = data.indexOf("=", start + 1);
                        end = data.indexOf(" ", delimiter + 1);
                        rxBytes = data.substring(delimiter + 1, end).trim();
                      }
                    }

                    if (end > delimiter) {
                      start = data.indexOf(NETWORK_KEYS[index][3], end + 1);
                      if (start >= 0) {
                        delimiter = data.indexOf("=", start + 1);
                        end = data.indexOf(" ", delimiter + 1);
                        rxPackets = data.substring(delimiter + 1, end).trim();
                      }
                    }

                    if (end > delimiter) {
                      start = data.indexOf(NETWORK_KEYS[index][4], end + 1);
                      if (start >= 0) {
                        delimiter = data.indexOf("=", start + 1);
                        end = data.indexOf(" ", delimiter + 1);
                        txBytes = data.substring(delimiter + 1, end).trim();
                      }
                    }

                    if (end > delimiter) {
                      start = data.indexOf(NETWORK_KEYS[index][5], end + 1);
                      if (start >= 0) {
                        delimiter = data.indexOf("=", start + 1);
                        end = data.indexOf(" ", delimiter + 1);
                        txPackets = data.substring(delimiter + 1, end).trim();
                      }
                    }

                    if (end > delimiter) {
                      start = data.indexOf(NETWORK_KEYS[index][6], end + 1);
                      if (start >= 0) {
                        delimiter = data.indexOf("=", start + 1);
                        end = data.length;
                        operations = data.substring(delimiter + 1, end).trim();
                      }
                    }
                    returnValue[returnIndex++] = [bucketStart, activeTime, rxBytes, rxPackets, txBytes, txPackets, operations, bucketDuration];
                  }
                }

              case 33:
                if (!(!_lodash2['default'].isEqual(pendingBytes, "") && !_lodash2['default'].isUndefined(pendingBytes) && !_lodash2['default'].isEqual(pendingBytes, "nodex"))) {
                  context$2$0.next = 37;
                  break;
                }

                return context$2$0.abrupt('return', returnValue);

              case 37:
                throw new Error('Unable to parse network traffic data: \'' + data + '\'');

              case 38:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this4);
        }));

      case 2:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

_Object$assign(extensions, commands, helpers);
exports.commands = commands;
exports.helpers = helpers;
exports.SUPPORTED_PERFORMANCE_DATA_TYPES = SUPPORTED_PERFORMANCE_DATA_TYPES;
exports.CPU_KEYS = CPU_KEYS;
exports.MEMORY_KEYS = MEMORY_KEYS;
exports.BATTERY_KEYS = BATTERY_KEYS;
exports.NETWORK_KEYS = NETWORK_KEYS;
exports['default'] = extensions;

// TODO: figure out why this is
// sometimes, the function of 'adb.shell' fails. when I tested this function on the target of 'Galaxy Note5',
// adb.shell(dumpsys cpuinfo) returns cpu datas for other application packages, but I can't find the data for packageName.
// It usually fails 30 times and success for the next time,
// Since then, he has continued to succeed.
//eslint-disable-line curly
// `data` will be something like
//    +0% 2209/io.appium.android.apis: 0% user + 0% kernel

//eslint-disable-line curly

//eslint-disable-line curly

//eslint-disable-line curly

//eslint-disable-line curly

// In case of network traffic information, it is different for the return data between emulator and real device.
// the return data of emulator
//   Xt stats:
//   Pending bytes: 39250
//   History since boot:
//   ident=[[type=WIFI, subType=COMBINED, networkId="WiredSSID"]] uid=-1 set=ALL tag=0x0
//   NetworkStatsHistory: bucketDuration=3600000
//   bucketStart=1478098800000 activeTime=31824 rxBytes=21502 rxPackets=78 txBytes=17748 txPackets=90 operations=0
//
// 7.1
//   Xt stats:
//   Pending bytes: 481487
//   History since boot:
//   ident=[{type=MOBILE, subType=COMBINED, subscriberId=310260..., metered=true}] uid=-1 set=ALL tag=0x0
//     NetworkStatsHistory: bucketDuration=3600
//       st=1483984800 rb=0 rp=0 tb=12031 tp=184 op=0
//       st=1483988400 rb=0 rp=0 tb=38476 tp=587 op=0
//       st=1483999200 rb=315616 rp=400 tb=94800 tp=362 op=0
//       st=1484002800 rb=15826 rp=20 tb=4738 tp=16 op=0
//
// the return data of real device
//   Xt stats:
//   Pending bytes: 0
//   History since boot:
//   ident=[{type=MOBILE, subType=COMBINED, subscriberId=450050...}] uid=-1 set=ALL tag=0x0
//   NetworkStatsHistory: bucketDuration=3600
//   st=1478088000 rb=32115296 rp=34291 tb=2956805 tp=25705 op=0
//   st=1478091600 rb=2714683 rp=11821 tb=1420564 tp=12650 op=0
//   st=1478095200 rb=10079213 rp=19962 tb=2487705 tp=20015 op=0
//   st=1478098800 rb=4444433 rp=10227 tb=1430356 tp=10493 op=0
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jb21tYW5kcy9wZXJmb3JtYW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQUFjLFFBQVE7Ozs7d0JBQ1EsVUFBVTs7QUFHeEMsSUFBSSxRQUFRLEdBQUcsRUFBRTtJQUFFLE9BQU8sR0FBRyxFQUFFO0lBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFakQsSUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUMzTSxJQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNwQyxJQUFNLFlBQVksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sV0FBVyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVqTyxJQUFNLGdDQUFnQyxHQUFHO0FBQ3ZDLFNBQU8sRUFBRSxnSEFBZ0g7QUFDekgsWUFBVSxFQUFFLCtHQUErRztBQUMzSCxhQUFXLEVBQUUseUdBQXlHO0FBQ3RILGFBQVcsRUFBRSxvR0FBb0c7Q0FDbEgsQ0FBQzs7QUFFRixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7Ozs7Ozs7QUFPekIsUUFBUSxDQUFDLHVCQUF1QixHQUFHLFlBQVk7QUFDN0MsU0FBTyxvQkFBRSxJQUFJLENBQUMsZ0NBQWdDLENBQUMs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QyxDQUFDO1FBQ3BDLFFBQVEsR0FBUixRQUFRO1FBQUUsT0FBTyxHQUFQLE9BQU87UUFBRSxnQ0FBZ0MsR0FBaEMsZ0NBQWdDO1FBQUUsUUFBUSxHQUFSLFFBQVE7UUFDN0QsV0FBVyxHQUFYLFdBQVc7UUFBRSxZQUFZLEdBQVosWUFBWTtRQUFFLFlBQVksR0FBWixZQUFZO3FCQUNqQyxVQUFVIiwiZmlsZSI6ImxpYi9jb21tYW5kcy9wZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyByZXRyeUludGVydmFsIH0gZnJvbSAnYXN5bmNib3gnO1xuXG5cbmxldCBjb21tYW5kcyA9IHt9LCBoZWxwZXJzID0ge30sIGV4dGVuc2lvbnMgPSB7fTtcblxuY29uc3QgTkVUV09SS19LRVlTID0gW1snYnVja2V0U3RhcnQnLCAnYWN0aXZlVGltZScsICdyeEJ5dGVzJywgJ3J4UGFja2V0cycsICd0eEJ5dGVzJywgJ3R4UGFja2V0cycsICdvcGVyYXRpb25zJywgJ2J1Y2tldER1cmF0aW9uJ10sIFsnc3QnLCAnYWN0aXZlVGltZScsICdyYicsICdycCcsICd0YicsICd0cCcsICdvcCcsICdidWNrZXREdXJhdGlvbiddXTtcbmNvbnN0IENQVV9LRVlTID0gWyd1c2VyJywgJ2tlcm5lbCddO1xuY29uc3QgQkFUVEVSWV9LRVlTID0gWydwb3dlciddO1xuY29uc3QgTUVNT1JZX0tFWVMgPSBbJ3RvdGFsUHJpdmF0ZURpcnR5JywgJ25hdGl2ZVByaXZhdGVEaXJ0eScsICdkYWx2aWtQcml2YXRlRGlydHknLCAnZWdsUHJpdmF0ZURpcnR5JywgJ2dsUHJpdmF0ZURpcnR5JywgJ3RvdGFsUHNzJywgJ25hdGl2ZVBzcycsICdkYWx2aWtQc3MnLCAnZWdsUHNzJywgJ2dsUHNzJywgJ25hdGl2ZUhlYXBBbGxvY2F0ZWRTaXplJywgJ25hdGl2ZUhlYXBTaXplJ107XG5cbmNvbnN0IFNVUFBPUlRFRF9QRVJGT1JNQU5DRV9EQVRBX1RZUEVTID0ge1xuICBjcHVpbmZvOiAndGhlIGFtb3VudCBvZiBjcHUgYnkgdXNlciBhbmQga2VybmVsIHByb2Nlc3MgLSBjcHUgaW5mb3JtYXRpb24gZm9yIGFwcGxpY2F0aW9ucyBvbiByZWFsIGRldmljZXMgYW5kIHNpbXVsYXRvcnMnLFxuICBtZW1vcnlpbmZvOiAndGhlIGFtb3VudCBvZiBtZW1vcnkgdXNlZCBieSB0aGUgcHJvY2VzcyAtIG1lbW9yeSBpbmZvcm1hdGlvbiBmb3IgYXBwbGljYXRpb25zIG9uIHJlYWwgZGV2aWNlcyBhbmQgc2ltdWxhdG9ycycsXG4gIGJhdHRlcnlpbmZvOiAndGhlIHJlbWFpbmluZyBiYXR0ZXJ5IHBvd2VyIC0gYmF0dGVyeSBwb3dlciBpbmZvcm1hdGlvbiBmb3IgYXBwbGljYXRpb25zIG9uIHJlYWwgZGV2aWNlcyBhbmQgc2ltdWxhdG9ycycsXG4gIG5ldHdvcmtpbmZvOiAndGhlIG5ldHdvcmsgc3RhdGlzdGljcyAtIG5ldHdvcmsgcngvdHggaW5mb3JtYXRpb24gZm9yIGFwcGxpY2F0aW9ucyBvbiByZWFsIGRldmljZXMgYW5kIHNpbXVsYXRvcnMnXG59O1xuXG5jb25zdCBSRVRSWV9QQVVTRSA9IDEwMDA7XG5cbi8vXG4vLyByZXR1cm5zIHRoZSBpbmZvcm1hdGlvbiB0eXBlIG9mIHRoZSBzeXN0ZW0gc3RhdGUgd2hpY2ggaXMgc3VwcG9ydGVkIHRvIHJlYWQgYXMgbGlrZSBjcHUsIG1lbW9yeSwgbmV0d29yayB0cmFmZmljLCBhbmQgYmF0dGVyeS5cbi8vIG91dHB1dCAtIGFycmF5IGxpa2UgYmVsb3dcbi8vW2NwdWluZm8sIGJhdHRlcnlpbmZvLCBuZXR3b3JraW5mbywgbWVtb3J5aW5mb11cbi8vXG5jb21tYW5kcy5nZXRQZXJmb3JtYW5jZURhdGFUeXBlcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIF8ua2V5cyhTVVBQT1JURURfUEVSRk9STUFOQ0VfREFUQV9UWVBFUyk7XG59O1xuXG4vLyByZXR1cm5zIHRoZSBpbmZvcm1hdGlvbiB0eXBlIG9mIHRoZSBzeXN0ZW0gc3RhdGUgd2hpY2ggaXMgc3VwcG9ydGVkIHRvIHJlYWQgYXMgbGlrZSBjcHUsIG1lbW9yeSwgbmV0d29yayB0cmFmZmljLCBhbmQgYmF0dGVyeS5cbi8vaW5wdXQgLSAocGFja2FnZU5hbWUpIHRoZSBwYWNrYWdlIG5hbWUgb2YgdGhlIGFwcGxpY2F0aW9uXG4vLyAgICAgICAgKGRhdGFUeXBlKSB0aGUgdHlwZSBvZiBzeXN0ZW0gc3RhdGUgd2hpY2ggd2FudHMgdG8gcmVhZC4gSXQgc2hvdWxkIGJlIG9uZSBvZiB0aGUga2V5cyBvZiB0aGUgU1VQUE9SVEVEX1BFUkZPUk1BTkNFX0RBVEFfVFlQRVNcbi8vICAgICAgICAoZGF0YVJlYWRUaW1lb3V0KSB0aGUgbnVtYmVyIG9mIGF0dGVtcHRzIHRvIHJlYWRcbi8vIG91dHB1dCAtIHRhYmxlIG9mIHRoZSBwZXJmb3JtYW5jZSBkYXRhLCBUaGUgZmlyc3QgbGluZSBvZiB0aGUgdGFibGUgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiBkYXRhLiBUaGUgcmVtYWluaW5nIGxpbmVzIHJlcHJlc2VudCB0aGUgdmFsdWVzIG9mIHRoZSBkYXRhLlxuLy9cbi8vIGluIGNhc2Ugb2YgYmF0dGVyeSBpbmZvIDogW1twb3dlcl0sIFsyM11dXG4vLyBpbiBjYXNlIG9mIG1lbW9yeSBpbmZvIDogIFtbdG90YWxQcml2YXRlRGlydHksIG5hdGl2ZVByaXZhdGVEaXJ0eSwgZGFsdmlrUHJpdmF0ZURpcnR5LCBlZ2xQcml2YXRlRGlydHksIGdsUHJpdmF0ZURpcnR5LCB0b3RhbFBzcywgbmF0aXZlUHNzLCBkYWx2aWtQc3MsIGVnbFBzcywgZ2xQc3MsIG5hdGl2ZUhlYXBBbGxvY2F0ZWRTaXplLCBuYXRpdmVIZWFwU2l6ZV0sIFsxODM2MCwgODI5NiwgNjEzMiwgbnVsbCwgbnVsbCwgNDI1ODgsIDg0MDYsIDcwMjQsIG51bGwsIG51bGwsIDI2NTE5LCAxMDM0NF1dXG4vLyBpbiBjYXNlIG9mIG5ldHdvcmsgaW5mbyA6IFtbYnVja2V0U3RhcnQsIGFjdGl2ZVRpbWUsIHJ4Qnl0ZXMsIHJ4UGFja2V0cywgdHhCeXRlcywgdHhQYWNrZXRzLCBvcGVyYXRpb25zLCBidWNrZXREdXJhdGlvbixdLCBbMTQ3ODA5MTYwMDAwMCwgbnVsbCwgMTA5OTA3NSwgNjEwOTQ3LCA5MjgsIDExNDM2MiwgNzY5LCAwLCAzNjAwMDAwXSwgWzE0NzgwOTUyMDAwMDAsIG51bGwsIDEzMDYzMDAsIDQwNTk5NywgNTA5LCA0NjM1OSwgMzcwLCAwLCAzNjAwMDAwXV1cbi8vIGluIGNhc2Ugb2YgbmV0d29yayBpbmZvIDogW1tzdCwgYWN0aXZlVGltZSwgcmIsIHJwLCB0YiwgdHAsIG9wLCBidWNrZXREdXJhdGlvbl0sIFsxNDc4MDg4MDAwLCBudWxsLCBudWxsLCAzMjExNTI5NiwgMzQyOTEsIDI5NTY4MDUsIDI1NzA1LCAwLCAzNjAwXSwgWzE0NzgwOTE2MDAsIG51bGwsIG51bGwsIDI3MTQ2ODMsIDExODIxLCAxNDIwNTY0LCAxMjY1MCwgMCwgMzYwMF0sIFsxNDc4MDk1MjAwLCBudWxsLCBudWxsLCAxMDA3OTIxMywgMTk5NjIsIDI0ODc3MDUsIDIwMDE1LCAwLCAzNjAwXSwgWzE0NzgwOTg4MDAsIG51bGwsIG51bGwsIDQ0NDQ0MzMsIDEwMjI3LCAxNDMwMzU2LCAxMDQ5MywgMCwgMzYwMF1dXG4vLyBpbiBjYXNlIG9mIGNwdSBpbmZvIDogW1t1c2VyLCBrZXJuZWxdLCBbMC45LCAxLjNdXVxuLy9cbmNvbW1hbmRzLmdldFBlcmZvcm1hbmNlRGF0YSA9IGFzeW5jIGZ1bmN0aW9uIChwYWNrYWdlTmFtZSwgZGF0YVR5cGUsIGRhdGFSZWFkVGltZW91dCA9IDIpIHtcbiAgbGV0IGRhdGE7XG4gIHN3aXRjaCAoZGF0YVR5cGUpIHtcbiAgICBjYXNlICdiYXR0ZXJ5aW5mbyc6XG4gICAgICBkYXRhID0gYXdhaXQgdGhpcy5nZXRCYXR0ZXJ5SW5mbyhkYXRhUmVhZFRpbWVvdXQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3B1aW5mbyc6XG4gICAgICBkYXRhID0gYXdhaXQgdGhpcy5nZXRDUFVJbmZvKHBhY2thZ2VOYW1lLCBkYXRhUmVhZFRpbWVvdXQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVtb3J5aW5mbyc6XG4gICAgICBkYXRhID0gYXdhaXQgdGhpcy5nZXRNZW1vcnlJbmZvKHBhY2thZ2VOYW1lLCBkYXRhUmVhZFRpbWVvdXQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbmV0d29ya2luZm8nOlxuICAgICAgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0TmV0d29ya1RyYWZmaWNJbmZvKGRhdGFSZWFkVGltZW91dCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBwZXJmb3JtYW5jZSBkYXRhIG9mIHR5cGUgJyR7ZGF0YVR5cGV9JyBmb3VuZC5gKTtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn07XG5cbmhlbHBlcnMuZ2V0Q1BVSW5mbyA9IGFzeW5jIGZ1bmN0aW9uIChwYWNrYWdlTmFtZSwgZGF0YVJlYWRUaW1lb3V0ID0gMikge1xuICAvLyBUT0RPOiBmaWd1cmUgb3V0IHdoeSB0aGlzIGlzXG4gIC8vIHNvbWV0aW1lcywgdGhlIGZ1bmN0aW9uIG9mICdhZGIuc2hlbGwnIGZhaWxzLiB3aGVuIEkgdGVzdGVkIHRoaXMgZnVuY3Rpb24gb24gdGhlIHRhcmdldCBvZiAnR2FsYXh5IE5vdGU1JyxcbiAgLy8gYWRiLnNoZWxsKGR1bXBzeXMgY3B1aW5mbykgcmV0dXJucyBjcHUgZGF0YXMgZm9yIG90aGVyIGFwcGxpY2F0aW9uIHBhY2thZ2VzLCBidXQgSSBjYW4ndCBmaW5kIHRoZSBkYXRhIGZvciBwYWNrYWdlTmFtZS5cbiAgLy8gSXQgdXN1YWxseSBmYWlscyAzMCB0aW1lcyBhbmQgc3VjY2VzcyBmb3IgdGhlIG5leHQgdGltZSxcbiAgLy8gU2luY2UgdGhlbiwgaGUgaGFzIGNvbnRpbnVlZCB0byBzdWNjZWVkLlxuICByZXR1cm4gYXdhaXQgcmV0cnlJbnRlcnZhbChkYXRhUmVhZFRpbWVvdXQsIFJFVFJZX1BBVVNFLCBhc3luYyAoKSA9PiB7XG4gICAgbGV0IGNtZCA9IFsnZHVtcHN5cycsICdjcHVpbmZvJywgJ3wnLCAnZ3JlcCcsIGAnJHtwYWNrYWdlTmFtZX0nYF07XG4gICAgbGV0IGRhdGEgPSBhd2FpdCB0aGlzLmFkYi5zaGVsbChjbWQpO1xuICAgIGlmICghZGF0YSkgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhIGZyb20gZHVtcHN5cycpOyAvL2VzbGludC1kaXNhYmxlLWxpbmUgY3VybHlcbiAgICAvLyBgZGF0YWAgd2lsbCBiZSBzb21ldGhpbmcgbGlrZVxuICAgIC8vICAgICswJSAyMjA5L2lvLmFwcGl1bS5hbmRyb2lkLmFwaXM6IDAlIHVzZXIgKyAwJSBrZXJuZWxcblxuICAgIGxldCBtYXRjaCA9IC8oXFxkKyklIHVzZXIgXFwrIChcXGQrKSUga2VybmVsLy5leGVjKGRhdGEpO1xuICAgIGlmICghbWF0Y2gpIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHBhcnNlIGNwdSBkYXRhOiAnJHtkYXRhfSdgKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIGN1cmx5XG5cbiAgICBsZXQgdXNlciA9IG1hdGNoWzFdO1xuICAgIGxldCBrZXJuZWwgPSBtYXRjaFsyXTtcbiAgICByZXR1cm4gW18uY2xvbmUoQ1BVX0tFWVMpLCBbdXNlciwga2VybmVsXV07XG4gIH0pO1xufTtcblxuaGVscGVycy5nZXRCYXR0ZXJ5SW5mbyA9IGFzeW5jIGZ1bmN0aW9uIChkYXRhUmVhZFRpbWVvdXQgPSAyKSB7XG4gIHJldHVybiBhd2FpdCByZXRyeUludGVydmFsKGRhdGFSZWFkVGltZW91dCwgUkVUUllfUEFVU0UsIGFzeW5jICgpID0+IHtcbiAgICBsZXQgY21kID0gWydkdW1wc3lzJywgJ2JhdHRlcnknLCAnfCcsICdncmVwJywgJ2xldmVsJ107XG4gICAgbGV0IGRhdGEgPSBhd2FpdCB0aGlzLmFkYi5zaGVsbChjbWQpO1xuICAgIGlmICghZGF0YSkgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhIGZyb20gZHVtcHN5cycpOyAvL2VzbGludC1kaXNhYmxlLWxpbmUgY3VybHlcblxuICAgIGxldCBwb3dlciA9IHBhcnNlSW50KChkYXRhLnNwbGl0KCc6JylbMV0gfHwgJycpLnRyaW0oKSwgMTApO1xuXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4ocG93ZXIpKSB7XG4gICAgICByZXR1cm4gW18uY2xvbmUoQkFUVEVSWV9LRVlTKSwgW3Bvd2VyLnRvU3RyaW5nKCldXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gcGFyc2UgYmF0dGVyeSBkYXRhOiAnJHtkYXRhfSdgKTtcbiAgICB9XG4gIH0pO1xuXG59O1xuXG5oZWxwZXJzLmdldE1lbW9yeUluZm8gPSBhc3luYyBmdW5jdGlvbiAocGFja2FnZU5hbWUsIGRhdGFSZWFkVGltZW91dCA9IDIpIHtcbiAgcmV0dXJuIGF3YWl0IHJldHJ5SW50ZXJ2YWwoZGF0YVJlYWRUaW1lb3V0LCBSRVRSWV9QQVVTRSwgYXN5bmMgKCkgPT4ge1xuICAgIGxldCBjbWQgPSBbJ2R1bXBzeXMnLCAnbWVtaW5mbycsIGAnJHtwYWNrYWdlTmFtZX0nYCwgJ3wnLCAnZ3JlcCcsICctRScsIFwiJ05hdGl2ZXxEYWx2aWt8RUdMfEdMfFRPVEFMJ1wiXTtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IHRoaXMuYWRiLnNoZWxsKGNtZCk7XG4gICAgaWYgKCFkYXRhKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGRhdGEgZnJvbSBkdW1wc3lzJyk7IC8vZXNsaW50LWRpc2FibGUtbGluZSBjdXJseVxuXG4gICAgbGV0IHRvdGFsUHJpdmF0ZURpcnR5LCB0b3RhbFBzcyxcbiAgICAgICAgbmF0aXZlUHJpdmF0ZURpcnR5LCBuYXRpdmVQc3MsIG5hdGl2ZUhlYXBTaXplLCBuYXRpdmVIZWFwQWxsb2NhdGVkU2l6ZSxcbiAgICAgICAgZGFsdmlrUHJpdmF0ZURpcnR5LCBkYWx2aWtQc3MsXG4gICAgICAgIGVnbFByaXZhdGVEaXJ0eSwgZWdsUHNzLFxuICAgICAgICBnbFByaXZhdGVEaXJ0eSwgZ2xQc3M7XG4gICAgbGV0IGFwaWxldmVsID0gYXdhaXQgdGhpcy5hZGIuZ2V0QXBpTGV2ZWwoKTtcbiAgICBmb3IgKGxldCBsaW5lIG9mIGRhdGEuc3BsaXQoJ1xcbicpKSB7XG4gICAgICBsZXQgZW50cmllcyA9IGxpbmUudHJpbSgpLnNwbGl0KCcgJykuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgLy8gZW50cmllcyB3aWxsIGhhdmUgdGhlIHZhbHVlc1xuICAgICAgLy8gICBbJzxTeXN0ZW0gVHlwZT4nLCAnPE1lbW9yeSBUeXBlPicsIDxwc3MgdG90YWw+LCA8cHJpdmF0ZSBkaXJ0eT4sIDxwcml2YXRlIGNsZWFuPiwgPHN3YXBQc3MgZGlydHk+LCA8aGVhcCBzaXplPiwgPGhlYXAgYWxsb2M+LCA8aGVhcCBmcmVlPl1cbiAgICAgIC8vIGV4Y2VwdCAnVE9UQUwnLCB3aGljaCBza2lwcyB0aGUgc2Vjb25kIHR5cGUgbmFtZVxuICAgICAgLy9cbiAgICAgIC8vIGFuZCBvbiBBUEkgbGV2ZWwgMTggYW5kIGJlbG93XG4gICAgICAvLyAgIFsnPFN5c3RlbSBUeXBlJywgJzxwcHM+JywgJzxzaGFyZWQgZGlydHk+JywgJzxwcml2YXRlIGRpcnR5PicsICc8aGVhcCBzaXplPicsICc8aGVhcCBhbGxvYz4nLCAnPGhlYXAgZnJlZT4nXVxuXG4gICAgICBpZiAoYXBpbGV2ZWwgPiAxOCkge1xuICAgICAgICBsZXQgdHlwZSA9IGVudHJpZXNbMF07XG4gICAgICAgIGxldCBzdWJUeXBlID0gZW50cmllc1sxXTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdOYXRpdmUnICYmIHN1YlR5cGUgPT09ICdIZWFwJykge1xuICAgICAgICAgIC8vIG5hdGl2ZSBoZWFwXG4gICAgICAgICAgbmF0aXZlUHNzID0gZW50cmllc1syXTtcbiAgICAgICAgICBuYXRpdmVQcml2YXRlRGlydHkgPSBlbnRyaWVzWzNdO1xuICAgICAgICAgIG5hdGl2ZUhlYXBTaXplID0gZW50cmllc1s2XTtcbiAgICAgICAgICBuYXRpdmVIZWFwQWxsb2NhdGVkU2l6ZSA9IGVudHJpZXNbN107XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0RhbHZpaycgJiYgc3ViVHlwZSA9PT0gJ0hlYXAnKSB7XG4gICAgICAgICAgLy8gZGFsdmlrIGhlYXBcbiAgICAgICAgICBkYWx2aWtQc3MgPSBlbnRyaWVzWzJdO1xuICAgICAgICAgIGRhbHZpa1ByaXZhdGVEaXJ0eSA9IGVudHJpZXNbM107XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VHTCcgJiYgc3ViVHlwZSA9PT0gJ210cmFjaycpIHtcbiAgICAgICAgICAvLyBlZ2xcbiAgICAgICAgICBlZ2xQc3MgPSBlbnRyaWVzWzJdO1xuICAgICAgICAgIGVnbFByaXZhdGVEaXJ0eSA9IGVudHJpZXNbM107XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0dMJyAmJiBzdWJUeXBlID09PSAnbXRyYWNrJykge1xuICAgICAgICAgIC8vIGdsXG4gICAgICAgICAgZ2xQc3MgPSBlbnRyaWVzWzJdO1xuICAgICAgICAgIGdsUHJpdmF0ZURpcnR5ID0gZW50cmllc1szXTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnVE9UQUwnICYmIGVudHJpZXMubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgLy8gdGhlcmUgYXJlIHR3byB0b3RhbHMsIGFuZCB3ZSBvbmx5IHdhbnQgdGhlIGZ1bGwgbGlzdGluZywgd2hpY2ggaGFzIDggZW50cmllc1xuICAgICAgICAgIHRvdGFsUHNzID0gZW50cmllc1sxXTtcbiAgICAgICAgICB0b3RhbFByaXZhdGVEaXJ0eSA9IGVudHJpZXNbMl07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0eXBlID0gZW50cmllc1swXTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdOYXRpdmUnKSB7XG4gICAgICAgICAgbmF0aXZlUHNzID0gZW50cmllc1sxXTtcbiAgICAgICAgICBuYXRpdmVQcml2YXRlRGlydHkgPSBlbnRyaWVzWzNdO1xuICAgICAgICAgIG5hdGl2ZUhlYXBTaXplID0gZW50cmllc1s0XTtcbiAgICAgICAgICBuYXRpdmVIZWFwQWxsb2NhdGVkU2l6ZSA9IGVudHJpZXNbNV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0RhbHZpaycpIHtcbiAgICAgICAgICBkYWx2aWtQc3MgPSBlbnRyaWVzWzFdO1xuICAgICAgICAgIGRhbHZpa1ByaXZhdGVEaXJ0eSA9IGVudHJpZXNbM107XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VHTCcpIHtcbiAgICAgICAgICBlZ2xQc3MgPSBlbnRyaWVzWzFdO1xuICAgICAgICAgIGVnbFByaXZhdGVEaXJ0eSA9IGVudHJpZXNbM107XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0dMJykge1xuICAgICAgICAgIGdsUHNzID0gZW50cmllc1sxXTtcbiAgICAgICAgICBnbFByaXZhdGVEaXJ0eSA9IGVudHJpZXNbM107XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ1RPVEFMJykge1xuICAgICAgICAgIHRvdGFsUHNzID0gZW50cmllc1sxXTtcbiAgICAgICAgICB0b3RhbFByaXZhdGVEaXJ0eSA9IGVudHJpZXNbM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodG90YWxQcml2YXRlRGlydHkgJiYgdG90YWxQcml2YXRlRGlydHkgIT09ICdub2RleCcpIHtcbiAgICAgIGxldCBoZWFkZXJzID0gXy5jbG9uZShNRU1PUllfS0VZUyk7XG4gICAgICBsZXQgZGF0YSA9IFt0b3RhbFByaXZhdGVEaXJ0eSwgbmF0aXZlUHJpdmF0ZURpcnR5LCBkYWx2aWtQcml2YXRlRGlydHksIGVnbFByaXZhdGVEaXJ0eSwgZ2xQcml2YXRlRGlydHksIHRvdGFsUHNzLCBuYXRpdmVQc3MsIGRhbHZpa1BzcywgZWdsUHNzLCBnbFBzcywgbmF0aXZlSGVhcEFsbG9jYXRlZFNpemUsIG5hdGl2ZUhlYXBTaXplXTtcbiAgICAgIHJldHVybiBbaGVhZGVycywgZGF0YV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHBhcnNlIG1lbW9yeSBkYXRhOiAnJHtkYXRhfSdgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuaGVscGVycy5nZXROZXR3b3JrVHJhZmZpY0luZm8gPSBhc3luYyBmdW5jdGlvbiAoZGF0YVJlYWRUaW1lb3V0ID0gMikge1xuICByZXR1cm4gYXdhaXQgcmV0cnlJbnRlcnZhbChkYXRhUmVhZFRpbWVvdXQsIFJFVFJZX1BBVVNFLCBhc3luYyAoKSA9PiB7XG4gICAgbGV0IHJldHVyblZhbHVlID0gW107XG4gICAgbGV0IGJ1Y2tldER1cmF0aW9uLCBidWNrZXRTdGFydCwgYWN0aXZlVGltZSwgcnhCeXRlcywgcnhQYWNrZXRzLCB0eEJ5dGVzLCB0eFBhY2tldHMsIG9wZXJhdGlvbnM7XG5cbiAgICBsZXQgY21kID0gWydkdW1wc3lzJywgJ25ldHN0YXRzJ107XG4gICAgbGV0IGRhdGEgPSBhd2FpdCB0aGlzLmFkYi5zaGVsbChjbWQpO1xuICAgIGlmICghZGF0YSkgdGhyb3cgbmV3IEVycm9yKCdObyBkYXRhIGZyb20gZHVtcHN5cycpOyAvL2VzbGludC1kaXNhYmxlLWxpbmUgY3VybHlcblxuICAgIC8vIEluIGNhc2Ugb2YgbmV0d29yayB0cmFmZmljIGluZm9ybWF0aW9uLCBpdCBpcyBkaWZmZXJlbnQgZm9yIHRoZSByZXR1cm4gZGF0YSBiZXR3ZWVuIGVtdWxhdG9yIGFuZCByZWFsIGRldmljZS5cbiAgICAvLyB0aGUgcmV0dXJuIGRhdGEgb2YgZW11bGF0b3JcbiAgICAvLyAgIFh0IHN0YXRzOlxuICAgIC8vICAgUGVuZGluZyBieXRlczogMzkyNTBcbiAgICAvLyAgIEhpc3Rvcnkgc2luY2UgYm9vdDpcbiAgICAvLyAgIGlkZW50PVtbdHlwZT1XSUZJLCBzdWJUeXBlPUNPTUJJTkVELCBuZXR3b3JrSWQ9XCJXaXJlZFNTSURcIl1dIHVpZD0tMSBzZXQ9QUxMIHRhZz0weDBcbiAgICAvLyAgIE5ldHdvcmtTdGF0c0hpc3Rvcnk6IGJ1Y2tldER1cmF0aW9uPTM2MDAwMDBcbiAgICAvLyAgIGJ1Y2tldFN0YXJ0PTE0NzgwOTg4MDAwMDAgYWN0aXZlVGltZT0zMTgyNCByeEJ5dGVzPTIxNTAyIHJ4UGFja2V0cz03OCB0eEJ5dGVzPTE3NzQ4IHR4UGFja2V0cz05MCBvcGVyYXRpb25zPTBcbiAgICAvL1xuICAgIC8vIDcuMVxuICAgIC8vICAgWHQgc3RhdHM6XG4gICAgLy8gICBQZW5kaW5nIGJ5dGVzOiA0ODE0ODdcbiAgICAvLyAgIEhpc3Rvcnkgc2luY2UgYm9vdDpcbiAgICAvLyAgIGlkZW50PVt7dHlwZT1NT0JJTEUsIHN1YlR5cGU9Q09NQklORUQsIHN1YnNjcmliZXJJZD0zMTAyNjAuLi4sIG1ldGVyZWQ9dHJ1ZX1dIHVpZD0tMSBzZXQ9QUxMIHRhZz0weDBcbiAgICAvLyAgICAgTmV0d29ya1N0YXRzSGlzdG9yeTogYnVja2V0RHVyYXRpb249MzYwMFxuICAgIC8vICAgICAgIHN0PTE0ODM5ODQ4MDAgcmI9MCBycD0wIHRiPTEyMDMxIHRwPTE4NCBvcD0wXG4gICAgLy8gICAgICAgc3Q9MTQ4Mzk4ODQwMCByYj0wIHJwPTAgdGI9Mzg0NzYgdHA9NTg3IG9wPTBcbiAgICAvLyAgICAgICBzdD0xNDgzOTk5MjAwIHJiPTMxNTYxNiBycD00MDAgdGI9OTQ4MDAgdHA9MzYyIG9wPTBcbiAgICAvLyAgICAgICBzdD0xNDg0MDAyODAwIHJiPTE1ODI2IHJwPTIwIHRiPTQ3MzggdHA9MTYgb3A9MFxuICAgIC8vXG4gICAgLy8gdGhlIHJldHVybiBkYXRhIG9mIHJlYWwgZGV2aWNlXG4gICAgLy8gICBYdCBzdGF0czpcbiAgICAvLyAgIFBlbmRpbmcgYnl0ZXM6IDBcbiAgICAvLyAgIEhpc3Rvcnkgc2luY2UgYm9vdDpcbiAgICAvLyAgIGlkZW50PVt7dHlwZT1NT0JJTEUsIHN1YlR5cGU9Q09NQklORUQsIHN1YnNjcmliZXJJZD00NTAwNTAuLi59XSB1aWQ9LTEgc2V0PUFMTCB0YWc9MHgwXG4gICAgLy8gICBOZXR3b3JrU3RhdHNIaXN0b3J5OiBidWNrZXREdXJhdGlvbj0zNjAwXG4gICAgLy8gICBzdD0xNDc4MDg4MDAwIHJiPTMyMTE1Mjk2IHJwPTM0MjkxIHRiPTI5NTY4MDUgdHA9MjU3MDUgb3A9MFxuICAgIC8vICAgc3Q9MTQ3ODA5MTYwMCByYj0yNzE0NjgzIHJwPTExODIxIHRiPTE0MjA1NjQgdHA9MTI2NTAgb3A9MFxuICAgIC8vICAgc3Q9MTQ3ODA5NTIwMCByYj0xMDA3OTIxMyBycD0xOTk2MiB0Yj0yNDg3NzA1IHRwPTIwMDE1IG9wPTBcbiAgICAvLyAgIHN0PTE0NzgwOTg4MDAgcmI9NDQ0NDQzMyBycD0xMDIyNyB0Yj0xNDMwMzU2IHRwPTEwNDkzIG9wPTBcbiAgICBsZXQgaW5kZXggPSAwO1xuICAgIGxldCBmcm9tWHRzdGF0cyA9IGRhdGEuaW5kZXhPZihcIlh0IHN0YXRzOlwiKTtcblxuICAgIGxldCBzdGFydCA9IGRhdGEuaW5kZXhPZihcIlBlbmRpbmcgYnl0ZXM6XCIsIGZyb21YdHN0YXRzKTtcbiAgICBsZXQgZGVsaW1pdGVyID0gZGF0YS5pbmRleE9mKFwiOlwiLCBzdGFydCArIDEpO1xuICAgIGxldCBlbmQgPSBkYXRhLmluZGV4T2YoXCJcXG5cIiwgZGVsaW1pdGVyICsgMSk7XG4gICAgbGV0IHBlbmRpbmdCeXRlcyA9IGRhdGEuc3Vic3RyaW5nKGRlbGltaXRlciArIDEsIGVuZCkudHJpbSgpO1xuXG4gICAgaWYgKGVuZCA+IGRlbGltaXRlcikge1xuICAgICAgc3RhcnQgPSBkYXRhLmluZGV4T2YoXCJidWNrZXREdXJhdGlvblwiLCBlbmQgKyAxKTtcbiAgICAgIGRlbGltaXRlciA9IGRhdGEuaW5kZXhPZihcIj1cIiwgc3RhcnQgKyAxKTtcbiAgICAgIGVuZCA9IGRhdGEuaW5kZXhPZihcIlxcblwiLCBkZWxpbWl0ZXIgKyAxKTtcbiAgICAgIGJ1Y2tldER1cmF0aW9uID0gZGF0YS5zdWJzdHJpbmcoZGVsaW1pdGVyICsgMSwgZW5kKS50cmltKCk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID49IDApIHtcbiAgICAgIGRhdGEgPSBkYXRhLnN1YnN0cmluZyhlbmQgKyAxLCBkYXRhLmxlbmd0aCk7XG4gICAgICBsZXQgYXJyYXlMaXN0ID0gZGF0YS5zcGxpdChcIlxcblwiKTtcblxuICAgICAgaWYgKGFycmF5TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN0YXJ0ID0gLTE7XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBORVRXT1JLX0tFWVMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBzdGFydCA9IGFycmF5TGlzdFswXS5pbmRleE9mKE5FVFdPUktfS0VZU1tqXVswXSk7XG5cbiAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBqO1xuICAgICAgICAgICAgcmV0dXJuVmFsdWVbMF0gPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBORVRXT1JLX0tFWVNbal0ubGVuZ3RoOyArK2spIHtcbiAgICAgICAgICAgICAgcmV0dXJuVmFsdWVbMF1ba10gPSBORVRXT1JLX0tFWVNbal1ba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmV0dXJuSW5kZXggPSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5TGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRhdGEgPSBhcnJheUxpc3RbaV07XG4gICAgICAgICAgc3RhcnQgPSBkYXRhLmluZGV4T2YoTkVUV09SS19LRVlTW2luZGV4XVswXSk7XG5cbiAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgZGVsaW1pdGVyID0gZGF0YS5pbmRleE9mKFwiPVwiLCBzdGFydCArIDEpO1xuICAgICAgICAgICAgZW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCBkZWxpbWl0ZXIgKyAxKTtcbiAgICAgICAgICAgIGJ1Y2tldFN0YXJ0ID0gZGF0YS5zdWJzdHJpbmcoZGVsaW1pdGVyICsgMSwgZW5kKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChlbmQgPiBkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBkYXRhLmluZGV4T2YoTkVUV09SS19LRVlTW2luZGV4XVsxXSwgZW5kKzEpO1xuICAgICAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IGRhdGEuaW5kZXhPZihcIj1cIiwgc3RhcnQgKyAxKTtcbiAgICAgICAgICAgICAgICBlbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIGRlbGltaXRlciArIDEpO1xuICAgICAgICAgICAgICAgIGFjdGl2ZVRpbWUgPSBkYXRhLnN1YnN0cmluZyhkZWxpbWl0ZXIgKyAxLCBlbmQpLnRyaW0oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZW5kID4gZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gZGF0YS5pbmRleE9mKE5FVFdPUktfS0VZU1tpbmRleF1bMl0sIGVuZCsxKTtcbiAgICAgICAgICAgICAgaWYgKHN0YXJ0ID49IDApIHtcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSBkYXRhLmluZGV4T2YoXCI9XCIsIHN0YXJ0ICsgMSk7XG4gICAgICAgICAgICAgICAgZW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCBkZWxpbWl0ZXIgKyAxKTtcbiAgICAgICAgICAgICAgICByeEJ5dGVzID0gZGF0YS5zdWJzdHJpbmcoZGVsaW1pdGVyICsgMSwgZW5kKS50cmltKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVuZCA+IGRlbGltaXRlcikge1xuICAgICAgICAgICAgICBzdGFydCA9IGRhdGEuaW5kZXhPZihORVRXT1JLX0tFWVNbaW5kZXhdWzNdLCBlbmQrMSk7XG4gICAgICAgICAgICAgIGlmIChzdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gZGF0YS5pbmRleE9mKFwiPVwiLCBzdGFydCArIDEpO1xuICAgICAgICAgICAgICAgIGVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgZGVsaW1pdGVyICsgMSk7XG4gICAgICAgICAgICAgICAgcnhQYWNrZXRzID0gZGF0YS5zdWJzdHJpbmcoZGVsaW1pdGVyICsgMSwgZW5kKS50cmltKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVuZCA+IGRlbGltaXRlcikge1xuICAgICAgICAgICAgICBzdGFydCA9IGRhdGEuaW5kZXhPZihORVRXT1JLX0tFWVNbaW5kZXhdWzRdLCBlbmQrMSk7XG4gICAgICAgICAgICAgIGlmIChzdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gZGF0YS5pbmRleE9mKFwiPVwiLCBzdGFydCArIDEpO1xuICAgICAgICAgICAgICAgIGVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgZGVsaW1pdGVyICsgMSk7XG4gICAgICAgICAgICAgICAgdHhCeXRlcyA9IGRhdGEuc3Vic3RyaW5nKGRlbGltaXRlciArIDEsIGVuZCkudHJpbSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbmQgPiBkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBkYXRhLmluZGV4T2YoTkVUV09SS19LRVlTW2luZGV4XVs1XSwgZW5kKzEpO1xuICAgICAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IGRhdGEuaW5kZXhPZihcIj1cIiwgc3RhcnQgKyAxKTtcbiAgICAgICAgICAgICAgICBlbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIGRlbGltaXRlciArIDEpO1xuICAgICAgICAgICAgICAgIHR4UGFja2V0cyA9IGRhdGEuc3Vic3RyaW5nKGRlbGltaXRlciArIDEsIGVuZCkudHJpbSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbmQgPiBkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBkYXRhLmluZGV4T2YoTkVUV09SS19LRVlTW2luZGV4XVs2XSwgZW5kKzEpO1xuICAgICAgICAgICAgICBpZiAoc3RhcnQgPj0gMCkge1xuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IGRhdGEuaW5kZXhPZihcIj1cIiwgc3RhcnQgKyAxKTtcbiAgICAgICAgICAgICAgICBlbmQgPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zID0gZGF0YS5zdWJzdHJpbmcoZGVsaW1pdGVyICsgMSwgZW5kKS50cmltKCk7XG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuVmFsdWVbcmV0dXJuSW5kZXgrK10gPSBbYnVja2V0U3RhcnQsIGFjdGl2ZVRpbWUsIHJ4Qnl0ZXMsIHJ4UGFja2V0cywgdHhCeXRlcywgdHhQYWNrZXRzLCBvcGVyYXRpb25zLCBidWNrZXREdXJhdGlvbl07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzRXF1YWwocGVuZGluZ0J5dGVzLCBcIlwiKSAmJiAhXy5pc1VuZGVmaW5lZChwZW5kaW5nQnl0ZXMpICYmICFfLmlzRXF1YWwocGVuZGluZ0J5dGVzLCBcIm5vZGV4XCIpKSB7XG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHBhcnNlIG5ldHdvcmsgdHJhZmZpYyBkYXRhOiAnJHtkYXRhfSdgKTtcbiAgICB9XG4gIH0pO1xufTtcblxuT2JqZWN0LmFzc2lnbihleHRlbnNpb25zLCBjb21tYW5kcywgaGVscGVycyk7XG5leHBvcnQgeyBjb21tYW5kcywgaGVscGVycywgU1VQUE9SVEVEX1BFUkZPUk1BTkNFX0RBVEFfVFlQRVMsIENQVV9LRVlTLFxuICAgICAgICAgTUVNT1JZX0tFWVMsIEJBVFRFUllfS0VZUywgTkVUV09SS19LRVlTIH07XG5leHBvcnQgZGVmYXVsdCBleHRlbnNpb25zO1xuIl0sInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
