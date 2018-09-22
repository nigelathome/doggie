require('source-map-support').install();

/* global describe:true, it:true */

'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _this = this;

var _ = require('../..');

var _mockRequest = require('./mock-request');

var _mockRequest2 = _interopRequireDefault(_mockRequest);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var should = _chai2['default'].should();
_chai2['default'].use(_chaiAsPromised2['default']);

function buildReqRes(url, method, body) {
  var req = { originalUrl: url, method: method, body: body };
  var res = {};
  res.headers = {};
  res.set = function (k, v) {
    res[k] = v;
  };
  res.status = function (code) {
    res.sentCode = code;
    return res;
  };
  res.send = function (body) {
    try {
      body = JSON.parse(body);
    } catch (e) {}
    res.sentBody = body;
  };
  return [req, res];
}

function mockProxy() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var proxy = new _.JWProxy(opts);
  proxy.request = function callee$1$0() {
    var args$2$0 = arguments;
    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return _regeneratorRuntime.awrap(_mockRequest2['default'].apply(undefined, args$2$0));

        case 2:
          return context$2$0.abrupt('return', context$2$0.sent);

        case 3:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  };
  return proxy;
}

describe('proxy', function () {
  it('should override default params', function () {
    var j = mockProxy({ server: '127.0.0.2' });
    j.server.should.equal('127.0.0.2');
    j.port.should.equal(4444);
  });
  it('should save session id on session creation', function callee$1$0() {
    var j, _ref, _ref2, res, body;

    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          j = mockProxy();
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(j.proxy('/session', 'POST', { desiredCapabilities: {} }));

        case 3:
          _ref = context$2$0.sent;
          _ref2 = _slicedToArray(_ref, 2);
          res = _ref2[0];
          body = _ref2[1];

          res.statusCode.should.equal(200);
          body.should.eql({ status: 0, sessionId: '123', value: { browserName: 'boo' } });
          j.sessionId.should.equal('123');

        case 10:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });
  it('should save session id on session creation with 303', function callee$1$0() {
    var j, _ref3, _ref32, res, body;

    return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          j = mockProxy();
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(j.proxy('/session', 'POST', { desiredCapabilities: { redirect: true } }));

        case 3:
          _ref3 = context$2$0.sent;
          _ref32 = _slicedToArray(_ref3, 2);
          res = _ref32[0];
          body = _ref32[1];

          res.statusCode.should.equal(303);
          body.should.eql('http://localhost:4444/wd/hub/session/123');
          j.sessionId.should.equal('123');

        case 10:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  });
  describe('getUrlForProxy', function () {
    it('should modify session id, host, and port', function callee$2$0() {
      var j;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });

            j.getUrlForProxy('http://host.com:1234/wd/hub/session/456/element/200/value').should.eql('http://localhost:4444/wd/hub/session/123/element/200/value');

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should prepend scheme, host and port if not provided', function callee$2$0() {
      var j;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });

            j.getUrlForProxy('/wd/hub/session/456/element/200/value').should.eql('http://localhost:4444/wd/hub/session/123/element/200/value');

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should work with urls which do not have session ids', function callee$2$0() {
      var j, newUrl;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });

            j.getUrlForProxy('http://host.com:1234/wd/hub/session').should.eql('http://localhost:4444/wd/hub/session');

            newUrl = j.getUrlForProxy('/wd/hub/session');

            newUrl.should.eql('http://localhost:4444/wd/hub/session');

          case 4:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should throw an error if url requires a sessionId but its null', function callee$2$0() {
      var j, e;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy();
            e = undefined;

            try {
              j.getUrlForProxy('/wd/hub/session/456/element/200/value');
            } catch (err) {
              e = err;
            }
            should.exist(e);
            e.message.should.contain('without session id');

          case 5:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should not throw an error if url does not require a session id and its null', function callee$2$0() {
      var j, newUrl;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy();
            newUrl = j.getUrlForProxy('/wd/hub/status');

            should.exist(newUrl);

          case 3:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });
  describe('straight proxy', function () {
    it('should successfully proxy straight', function callee$2$0() {
      var j, _ref4, _ref42, res, body;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy();
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(j.proxy('/status', 'GET'));

          case 3:
            _ref4 = context$3$0.sent;
            _ref42 = _slicedToArray(_ref4, 2);
            res = _ref42[0];
            body = _ref42[1];

            res.statusCode.should.equal(200);
            body.should.eql({ status: 0, value: { foo: 'bar' } });

          case 9:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should pass along request errors', function callee$2$0() {
      var j;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });

            j.proxy('/badurl', 'GET').should.eventually.be.rejectedWith("Could not proxy");

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should proxy error responses and codes', function callee$2$0() {
      var j, _ref5, _ref52, res, body;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(j.proxy('/element/bad/text', 'GET'));

          case 3:
            _ref5 = context$3$0.sent;
            _ref52 = _slicedToArray(_ref5, 2);
            res = _ref52[0];
            body = _ref52[1];

            res.statusCode.should.equal(500);
            body.should.eql({ status: 11, value: { message: 'Invisible element' } });

          case 9:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });
  describe('command proxy', function () {
    it('should successfully proxy command', function callee$2$0() {
      var j, res;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy();
            context$3$0.next = 3;
            return _regeneratorRuntime.awrap(j.command('/status', 'GET'));

          case 3:
            res = context$3$0.sent;

            res.should.eql({ foo: 'bar' });

          case 5:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should pass along request errors', function callee$2$0() {
      var j;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });

            j.command('/badurl', 'GET').should.eventually.be.rejectedWith("Could not proxy");

          case 2:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should throw when a command fails', function callee$2$0() {
      var j, e;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            e = null;
            context$3$0.prev = 2;
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(j.command('/element/bad/text', 'GET'));

          case 5:
            context$3$0.next = 10;
            break;

          case 7:
            context$3$0.prev = 7;
            context$3$0.t0 = context$3$0['catch'](2);

            e = context$3$0.t0;

          case 10:
            should.exist(e);
            e.message.should.contain('Original error: Invisible element');
            e.value.should.eql({ message: 'Invisible element' });
            e.status.should.equal(11);

          case 14:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this, [[2, 7]]);
    });
    it('should throw when a command fails with a 200 because the status is not 0', function callee$2$0() {
      var j, e;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            e = null;
            context$3$0.prev = 2;
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(j.command('/element/200/text', 'GET'));

          case 5:
            context$3$0.next = 10;
            break;

          case 7:
            context$3$0.prev = 7;
            context$3$0.t0 = context$3$0['catch'](2);

            e = context$3$0.t0;

          case 10:
            should.exist(e);
            e.message.should.contain('Original error: Invisible element');
            e.value.should.eql({ message: 'Invisible element' });
            e.status.should.equal(11);

          case 14:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this, [[2, 7]]);
    });
    it('should throw when a command fails with a 100', function callee$2$0() {
      var j, e;
      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            e = null;
            context$3$0.prev = 2;
            context$3$0.next = 5;
            return _regeneratorRuntime.awrap(j.command('/session/badchrome/nochrome', 'GET'));

          case 5:
            context$3$0.next = 10;
            break;

          case 7:
            context$3$0.prev = 7;
            context$3$0.t0 = context$3$0['catch'](2);

            e = context$3$0.t0;

          case 10:
            should.exist(e);
            e.message.should.contain('Original error: chrome not reachable');
            e.value.should.eql({ message: 'chrome not reachable' });
            e.status.should.equal(0);

          case 14:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this, [[2, 7]]);
    });
  });
  describe('req/res proxy', function () {
    it('should successfully proxy via req and send to res', function callee$2$0() {
      var j, _buildReqRes, _buildReqRes2, req, res;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy();
            _buildReqRes = buildReqRes('/status', 'GET');
            _buildReqRes2 = _slicedToArray(_buildReqRes, 2);
            req = _buildReqRes2[0];
            res = _buildReqRes2[1];
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(j.proxyReqRes(req, res));

          case 7:
            res.headers['Content-type'].should.equal('application/json');
            res.sentCode.should.equal(200);
            res.sentBody.should.eql({ status: 0, value: { foo: 'bar' } });

          case 10:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should rewrite the inner session id so it doesnt change', function callee$2$0() {
      var j, _buildReqRes3, _buildReqRes32, req, res;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            _buildReqRes3 = buildReqRes('/element/200/value', 'GET');
            _buildReqRes32 = _slicedToArray(_buildReqRes3, 2);
            req = _buildReqRes32[0];
            res = _buildReqRes32[1];
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(j.proxyReqRes(req, res));

          case 7:
            res.sentBody.should.eql({ status: 0, value: 'foobar', sessionId: '123' });

          case 8:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should rewrite the inner session id with sessionId in url', function callee$2$0() {
      var j, _buildReqRes4, _buildReqRes42, req, res;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            _buildReqRes4 = buildReqRes('/wd/hub/session/456/element/200/value', 'POST');
            _buildReqRes42 = _slicedToArray(_buildReqRes4, 2);
            req = _buildReqRes42[0];
            res = _buildReqRes42[1];
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(j.proxyReqRes(req, res));

          case 7:
            res.sentBody.should.eql({ status: 0, value: 'foobar', sessionId: '456' });

          case 8:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should pass through urls that do not require session IDs', function callee$2$0() {
      var j, _buildReqRes5, _buildReqRes52, req, res;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            _buildReqRes5 = buildReqRes('/wd/hub/status', 'GET');
            _buildReqRes52 = _slicedToArray(_buildReqRes5, 2);
            req = _buildReqRes52[0];
            res = _buildReqRes52[1];
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(j.proxyReqRes(req, res));

          case 7:
            res.sentBody.should.eql({ status: 0, value: { 'foo': 'bar' } });

          case 8:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
    it('should proxy strange responses', function callee$2$0() {
      var j, _buildReqRes6, _buildReqRes62, req, res;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            j = mockProxy({ sessionId: '123' });
            _buildReqRes6 = buildReqRes('/nochrome', 'GET');
            _buildReqRes62 = _slicedToArray(_buildReqRes6, 2);
            req = _buildReqRes62[0];
            res = _buildReqRes62[1];
            context$3$0.next = 7;
            return _regeneratorRuntime.awrap(j.proxyReqRes(req, res));

          case 7:
            res.sentCode.should.equal(100);
            res.sentBody.should.eql({ status: 0, value: { message: 'chrome not reachable' } });

          case 9:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvanNvbndwLXByb3h5L3Byb3h5LXNwZWNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Z0JBR3dCLE9BQU87OzJCQUNYLGdCQUFnQjs7OztvQkFDbkIsTUFBTTs7Ozs4QkFDSSxrQkFBa0I7Ozs7QUFHN0MsSUFBTSxNQUFNLEdBQUcsa0JBQUssTUFBTSxFQUFFLENBQUM7QUFDN0Isa0JBQUssR0FBRyw2QkFBZ0IsQ0FBQzs7QUFFekIsU0FBUyxXQUFXLENBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDdkMsTUFBSSxHQUFHLEdBQUcsRUFBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDO0FBQzNDLE1BQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLEtBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLEtBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQUUsT0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUFFLENBQUM7QUFDcEMsS0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFDLElBQUksRUFBSztBQUNyQixPQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNwQixXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUM7QUFDRixLQUFHLENBQUMsSUFBSSxHQUFHLFVBQUMsSUFBSSxFQUFLO0FBQ25CLFFBQUk7QUFDRixVQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN6QixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDZCxPQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztHQUNyQixDQUFDO0FBQ0YsU0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUNuQjs7QUFFRCxTQUFTLFNBQVMsR0FBYTtNQUFYLElBQUks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Rzs7Ozs7QUFEVCxhQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDOzRCQUNwQixXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQzs7QUFBM0MsZUFBRztBQUFFLGVBQUc7OzZDQUNQLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzs7O0FBQzdCLGVBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixlQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBQyxFQUFDLENBQUMsQ0FBQzs7Ozs7OztLQUNoRixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoidGVzdC9qc29ud3AtcHJveHkvcHJveHktc3BlY3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0cmFuc3BpbGU6bW9jaGFcclxuLyogZ2xvYmFsIGRlc2NyaWJlOnRydWUsIGl0OnRydWUgKi9cclxuXHJcbmltcG9ydCB7IEpXUHJveHkgfSBmcm9tICcuLi8uLic7XHJcbmltcG9ydCByZXF1ZXN0IGZyb20gJy4vbW9jay1yZXF1ZXN0JztcclxuaW1wb3J0IGNoYWkgZnJvbSAnY2hhaSc7XHJcbmltcG9ydCBjaGFpQXNQcm9taXNlZCBmcm9tICdjaGFpLWFzLXByb21pc2VkJztcclxuXHJcblxyXG5jb25zdCBzaG91bGQgPSBjaGFpLnNob3VsZCgpO1xyXG5jaGFpLnVzZShjaGFpQXNQcm9taXNlZCk7XHJcblxyXG5mdW5jdGlvbiBidWlsZFJlcVJlcyAodXJsLCBtZXRob2QsIGJvZHkpIHtcclxuICBsZXQgcmVxID0ge29yaWdpbmFsVXJsOiB1cmwsIG1ldGhvZCwgYm9keX07XHJcbiAgbGV0IHJlcyA9IHt9O1xyXG4gIHJlcy5oZWFkZXJzID0ge307XHJcbiAgcmVzLnNldCA9IChrLCB2KSA9PiB7IHJlc1trXSA9IHY7IH07XHJcbiAgcmVzLnN0YXR1cyA9IChjb2RlKSA9PiB7XHJcbiAgICByZXMuc2VudENvZGUgPSBjb2RlO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9O1xyXG4gIHJlcy5zZW5kID0gKGJvZHkpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgfSBjYXRjaCAoZSkge31cclxuICAgIHJlcy5zZW50Qm9keSA9IGJvZHk7XHJcbiAgfTtcclxuICByZXR1cm4gW3JlcSwgcmVzXTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW9ja1Byb3h5IChvcHRzID0ge30pIHtcclxuICBsZXQgcHJveHkgPSBuZXcgSldQcm94eShvcHRzKTtcclxuICBwcm94eS5yZXF1ZXN0ID0gYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiBhd2FpdCByZXF1ZXN0KC4uLmFyZ3MpO1xyXG4gIH07XHJcbiAgcmV0dXJuIHByb3h5O1xyXG59XHJcblxyXG5kZXNjcmliZSgncHJveHknLCAoKSA9PiB7XHJcbiAgaXQoJ3Nob3VsZCBvdmVycmlkZSBkZWZhdWx0IHBhcmFtcycsICgpID0+IHtcclxuICAgIGxldCBqID0gbW9ja1Byb3h5KHtzZXJ2ZXI6ICcxMjcuMC4wLjInfSk7XHJcbiAgICBqLnNlcnZlci5zaG91bGQuZXF1YWwoJzEyNy4wLjAuMicpO1xyXG4gICAgai5wb3J0LnNob3VsZC5lcXVhbCg0NDQ0KTtcclxuICB9KTtcclxuICBpdCgnc2hvdWxkIHNhdmUgc2Vzc2lvbiBpZCBvbiBzZXNzaW9uIGNyZWF0aW9uJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgbGV0IGogPSBtb2NrUHJveHkoKTtcclxuICAgIGxldCBbcmVzLCBib2R5XSA9IGF3YWl0IGoucHJveHkoJy9zZXNzaW9uJywgJ1BPU1QnLCB7ZGVzaXJlZENhcGFiaWxpdGllczoge319KTtcclxuICAgIHJlcy5zdGF0dXNDb2RlLnNob3VsZC5lcXVhbCgyMDApO1xyXG4gICAgYm9keS5zaG91bGQuZXFsKHtzdGF0dXM6IDAsIHNlc3Npb25JZDogJzEyMycsIHZhbHVlOiB7YnJvd3Nlck5hbWU6ICdib28nfX0pO1xyXG4gICAgai5zZXNzaW9uSWQuc2hvdWxkLmVxdWFsKCcxMjMnKTtcclxuICB9KTtcclxuICBpdCgnc2hvdWxkIHNhdmUgc2Vzc2lvbiBpZCBvbiBzZXNzaW9uIGNyZWF0aW9uIHdpdGggMzAzJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgbGV0IGogPSBtb2NrUHJveHkoKTtcclxuICAgIGxldCBbcmVzLCBib2R5XSA9IGF3YWl0IGoucHJveHkoJy9zZXNzaW9uJywgJ1BPU1QnLCB7ZGVzaXJlZENhcGFiaWxpdGllczoge3JlZGlyZWN0OiB0cnVlfX0pO1xyXG4gICAgcmVzLnN0YXR1c0NvZGUuc2hvdWxkLmVxdWFsKDMwMyk7XHJcbiAgICBib2R5LnNob3VsZC5lcWwoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDQ0NC93ZC9odWIvc2Vzc2lvbi8xMjMnKTtcclxuICAgIGouc2Vzc2lvbklkLnNob3VsZC5lcXVhbCgnMTIzJyk7XHJcbiAgfSk7XHJcbiAgZGVzY3JpYmUoJ2dldFVybEZvclByb3h5JywgKCkgPT4ge1xyXG4gICAgaXQoJ3Nob3VsZCBtb2RpZnkgc2Vzc2lvbiBpZCwgaG9zdCwgYW5kIHBvcnQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBqID0gbW9ja1Byb3h5KHtzZXNzaW9uSWQ6ICcxMjMnfSk7XHJcbiAgICAgIGouZ2V0VXJsRm9yUHJveHkoJ2h0dHA6Ly9ob3N0LmNvbToxMjM0L3dkL2h1Yi9zZXNzaW9uLzQ1Ni9lbGVtZW50LzIwMC92YWx1ZScpXHJcbiAgICAgICAuc2hvdWxkLmVxbCgnaHR0cDovL2xvY2FsaG9zdDo0NDQ0L3dkL2h1Yi9zZXNzaW9uLzEyMy9lbGVtZW50LzIwMC92YWx1ZScpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnc2hvdWxkIHByZXBlbmQgc2NoZW1lLCBob3N0IGFuZCBwb3J0IGlmIG5vdCBwcm92aWRlZCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgbGV0IGogPSBtb2NrUHJveHkoe3Nlc3Npb25JZDogJzEyMyd9KTtcclxuICAgICAgai5nZXRVcmxGb3JQcm94eSgnL3dkL2h1Yi9zZXNzaW9uLzQ1Ni9lbGVtZW50LzIwMC92YWx1ZScpXHJcbiAgICAgICAuc2hvdWxkLmVxbCgnaHR0cDovL2xvY2FsaG9zdDo0NDQ0L3dkL2h1Yi9zZXNzaW9uLzEyMy9lbGVtZW50LzIwMC92YWx1ZScpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnc2hvdWxkIHdvcmsgd2l0aCB1cmxzIHdoaWNoIGRvIG5vdCBoYXZlIHNlc3Npb24gaWRzJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBsZXQgaiA9IG1vY2tQcm94eSh7c2Vzc2lvbklkOiAnMTIzJ30pO1xyXG4gICAgICBqLmdldFVybEZvclByb3h5KCdodHRwOi8vaG9zdC5jb206MTIzNC93ZC9odWIvc2Vzc2lvbicpXHJcbiAgICAgICAuc2hvdWxkLmVxbCgnaHR0cDovL2xvY2FsaG9zdDo0NDQ0L3dkL2h1Yi9zZXNzaW9uJyk7XHJcblxyXG4gICAgICBsZXQgbmV3VXJsID0gai5nZXRVcmxGb3JQcm94eSgnL3dkL2h1Yi9zZXNzaW9uJyk7XHJcbiAgICAgIG5ld1VybC5zaG91bGQuZXFsKCdodHRwOi8vbG9jYWxob3N0OjQ0NDQvd2QvaHViL3Nlc3Npb24nKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyBhbiBlcnJvciBpZiB1cmwgcmVxdWlyZXMgYSBzZXNzaW9uSWQgYnV0IGl0cyBudWxsJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBsZXQgaiA9IG1vY2tQcm94eSgpO1xyXG4gICAgICBsZXQgZTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBqLmdldFVybEZvclByb3h5KCcvd2QvaHViL3Nlc3Npb24vNDU2L2VsZW1lbnQvMjAwL3ZhbHVlJyk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGUgPSBlcnI7XHJcbiAgICAgIH1cclxuICAgICAgc2hvdWxkLmV4aXN0KGUpO1xyXG4gICAgICBlLm1lc3NhZ2Uuc2hvdWxkLmNvbnRhaW4oJ3dpdGhvdXQgc2Vzc2lvbiBpZCcpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnc2hvdWxkIG5vdCB0aHJvdyBhbiBlcnJvciBpZiB1cmwgZG9lcyBub3QgcmVxdWlyZSBhIHNlc3Npb24gaWQgYW5kIGl0cyBudWxsJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBsZXQgaiA9IG1vY2tQcm94eSgpO1xyXG4gICAgICBsZXQgbmV3VXJsID0gai5nZXRVcmxGb3JQcm94eSgnL3dkL2h1Yi9zdGF0dXMnKTtcclxuXHJcbiAgICAgIHNob3VsZC5leGlzdChuZXdVcmwpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbiAgZGVzY3JpYmUoJ3N0cmFpZ2h0IHByb3h5JywgKCkgPT4ge1xyXG4gICAgaXQoJ3Nob3VsZCBzdWNjZXNzZnVsbHkgcHJveHkgc3RyYWlnaHQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBqID0gbW9ja1Byb3h5KCk7XHJcbiAgICAgIGxldCBbcmVzLCBib2R5XSA9IGF3YWl0IGoucHJveHkoJy9zdGF0dXMnLCAnR0VUJyk7XHJcbiAgICAgIHJlcy5zdGF0dXNDb2RlLnNob3VsZC5lcXVhbCgyMDApO1xyXG4gICAgICBib2R5LnNob3VsZC5lcWwoe3N0YXR1czogMCwgdmFsdWU6IHtmb286ICdiYXInfX0pO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnc2hvdWxkIHBhc3MgYWxvbmcgcmVxdWVzdCBlcnJvcnMnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBqID0gbW9ja1Byb3h5KHtzZXNzaW9uSWQ6ICcxMjMnfSk7XHJcbiAgICAgIGoucHJveHkoJy9iYWR1cmwnLCAnR0VUJykuc2hvdWxkLmV2ZW50dWFsbHkuYmUucmVqZWN0ZWRXaXRoKFwiQ291bGQgbm90IHByb3h5XCIpO1xyXG4gICAgfSk7XHJcbiAgICBpdCgnc2hvdWxkIHByb3h5IGVycm9yIHJlc3BvbnNlcyBhbmQgY29kZXMnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBqID0gbW9ja1Byb3h5KHtzZXNzaW9uSWQ6ICcxMjMnfSk7XHJcbiAgICAgIGxldCBbcmVzLCBib2R5XSA9IGF3YWl0IGoucHJveHkoJy9lbGVtZW50L2JhZC90ZXh0JywgJ0dFVCcpO1xyXG4gICAgICByZXMuc3RhdHVzQ29kZS5zaG91bGQuZXF1YWwoNTAwKTtcclxuICAgICAgYm9keS5zaG91bGQuZXFsKHtzdGF0dXM6IDExLCB2YWx1ZToge21lc3NhZ2U6ICdJbnZpc2libGUgZWxlbWVudCd9fSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICBkZXNjcmliZSgnY29tbWFuZCBwcm94eScsICgpID0+IHtcclxuICAgIGl0KCdzaG91bGQgc3VjY2Vzc2Z1bGx5IHByb3h5IGNvbW1hbmQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBqID0gbW9ja1Byb3h5KCk7XHJcbiAgICAgIGxldCByZXMgPSBhd2FpdCBqLmNvbW1hbmQoJy9zdGF0dXMnLCAnR0VUJyk7XHJcbiAgICAgIHJlcy5zaG91bGQuZXFsKHtmb286ICdiYXInfSk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdzaG91bGQgcGFzcyBhbG9uZyByZXF1ZXN0IGVycm9ycycsIGFzeW5jICgpID0+IHtcclxuICAgICAgbGV0IGogPSBtb2NrUHJveHkoe3Nlc3Npb25JZDogJzEyMyd9KTtcclxuICAgICAgai5jb21tYW5kKCcvYmFkdXJsJywgJ0dFVCcpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aChcIkNvdWxkIG5vdCBwcm94eVwiKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyB3aGVuIGEgY29tbWFuZCBmYWlscycsIGFzeW5jICgpID0+IHtcclxuICAgICAgbGV0IGogPSBtb2NrUHJveHkoe3Nlc3Npb25JZDogJzEyMyd9KTtcclxuICAgICAgbGV0IGUgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGouY29tbWFuZCgnL2VsZW1lbnQvYmFkL3RleHQnLCAnR0VUJyk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGUgPSBlcnI7XHJcbiAgICAgIH1cclxuICAgICAgc2hvdWxkLmV4aXN0KGUpO1xyXG4gICAgICBlLm1lc3NhZ2Uuc2hvdWxkLmNvbnRhaW4oJ09yaWdpbmFsIGVycm9yOiBJbnZpc2libGUgZWxlbWVudCcpO1xyXG4gICAgICBlLnZhbHVlLnNob3VsZC5lcWwoe21lc3NhZ2U6ICdJbnZpc2libGUgZWxlbWVudCd9KTtcclxuICAgICAgZS5zdGF0dXMuc2hvdWxkLmVxdWFsKDExKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyB3aGVuIGEgY29tbWFuZCBmYWlscyB3aXRoIGEgMjAwIGJlY2F1c2UgdGhlIHN0YXR1cyBpcyBub3QgMCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgbGV0IGogPSBtb2NrUHJveHkoe3Nlc3Npb25JZDogJzEyMyd9KTtcclxuICAgICAgbGV0IGUgPSBudWxsO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGouY29tbWFuZCgnL2VsZW1lbnQvMjAwL3RleHQnLCAnR0VUJyk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGUgPSBlcnI7XHJcbiAgICAgIH1cclxuICAgICAgc2hvdWxkLmV4aXN0KGUpO1xyXG4gICAgICBlLm1lc3NhZ2Uuc2hvdWxkLmNvbnRhaW4oJ09yaWdpbmFsIGVycm9yOiBJbnZpc2libGUgZWxlbWVudCcpO1xyXG4gICAgICBlLnZhbHVlLnNob3VsZC5lcWwoe21lc3NhZ2U6ICdJbnZpc2libGUgZWxlbWVudCd9KTtcclxuICAgICAgZS5zdGF0dXMuc2hvdWxkLmVxdWFsKDExKTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3Nob3VsZCB0aHJvdyB3aGVuIGEgY29tbWFuZCBmYWlscyB3aXRoIGEgMTAwJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBsZXQgaiA9IG1vY2tQcm94eSh7c2Vzc2lvbklkOiAnMTIzJ30pO1xyXG4gICAgICBsZXQgZSA9IG51bGw7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgai5jb21tYW5kKCcvc2Vzc2lvbi9iYWRjaHJvbWUvbm9jaHJvbWUnLCAnR0VUJyk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGUgPSBlcnI7XHJcbiAgICAgIH1cclxuICAgICAgc2hvdWxkLmV4aXN0KGUpO1xyXG4gICAgICBlLm1lc3NhZ2Uuc2hvdWxkLmNvbnRhaW4oJ09yaWdpbmFsIGVycm9yOiBjaHJvbWUgbm90IHJlYWNoYWJsZScpO1xyXG4gICAgICBlLnZhbHVlLnNob3VsZC5lcWwoe21lc3NhZ2U6ICdjaHJvbWUgbm90IHJlYWNoYWJsZSd9KTtcclxuICAgICAgZS5zdGF0dXMuc2hvdWxkLmVxdWFsKDApO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbiAgZGVzY3JpYmUoJ3JlcS9yZXMgcHJveHknLCAoKSA9PiB7XHJcbiAgICBpdCgnc2hvdWxkIHN1Y2Nlc3NmdWxseSBwcm94eSB2aWEgcmVxIGFuZCBzZW5kIHRvIHJlcycsIGFzeW5jICgpID0+IHtcclxuICAgICAgbGV0IGogPSBtb2NrUHJveHkoKTtcclxuICAgICAgbGV0IFtyZXEsIHJlc10gPSBidWlsZFJlcVJlcygnL3N0YXR1cycsICdHRVQnKTtcclxuICAgICAgYXdhaXQgai5wcm94eVJlcVJlcyhyZXEsIHJlcyk7XHJcbiAgICAgIHJlcy5oZWFkZXJzWydDb250ZW50LXR5cGUnXS5zaG91bGQuZXF1YWwoJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgcmVzLnNlbnRDb2RlLnNob3VsZC5lcXVhbCgyMDApO1xyXG4gICAgICByZXMuc2VudEJvZHkuc2hvdWxkLmVxbCh7c3RhdHVzOiAwLCB2YWx1ZToge2ZvbzogJ2Jhcid9fSk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdzaG91bGQgcmV3cml0ZSB0aGUgaW5uZXIgc2Vzc2lvbiBpZCBzbyBpdCBkb2VzbnQgY2hhbmdlJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBsZXQgaiA9IG1vY2tQcm94eSh7c2Vzc2lvbklkOiAnMTIzJ30pO1xyXG4gICAgICBsZXQgW3JlcSwgcmVzXSA9IGJ1aWxkUmVxUmVzKCcvZWxlbWVudC8yMDAvdmFsdWUnLCAnR0VUJyk7XHJcbiAgICAgIGF3YWl0IGoucHJveHlSZXFSZXMocmVxLCByZXMpO1xyXG4gICAgICByZXMuc2VudEJvZHkuc2hvdWxkLmVxbCh7c3RhdHVzOiAwLCB2YWx1ZTogJ2Zvb2JhcicsIHNlc3Npb25JZDogJzEyMyd9KTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3Nob3VsZCByZXdyaXRlIHRoZSBpbm5lciBzZXNzaW9uIGlkIHdpdGggc2Vzc2lvbklkIGluIHVybCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgbGV0IGogPSBtb2NrUHJveHkoe3Nlc3Npb25JZDogJzEyMyd9KTtcclxuICAgICAgbGV0IFtyZXEsIHJlc10gPSBidWlsZFJlcVJlcygnL3dkL2h1Yi9zZXNzaW9uLzQ1Ni9lbGVtZW50LzIwMC92YWx1ZScsICdQT1NUJyk7XHJcbiAgICAgIGF3YWl0IGoucHJveHlSZXFSZXMocmVxLCByZXMpO1xyXG4gICAgICByZXMuc2VudEJvZHkuc2hvdWxkLmVxbCh7c3RhdHVzOiAwLCB2YWx1ZTogJ2Zvb2JhcicsIHNlc3Npb25JZDogJzQ1Nid9KTtcclxuICAgIH0pO1xyXG4gICAgaXQoJ3Nob3VsZCBwYXNzIHRocm91Z2ggdXJscyB0aGF0IGRvIG5vdCByZXF1aXJlIHNlc3Npb24gSURzJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBsZXQgaiA9IG1vY2tQcm94eSh7c2Vzc2lvbklkOiAnMTIzJ30pO1xyXG4gICAgICBsZXQgW3JlcSwgcmVzXSA9IGJ1aWxkUmVxUmVzKCcvd2QvaHViL3N0YXR1cycsICdHRVQnKTtcclxuICAgICAgYXdhaXQgai5wcm94eVJlcVJlcyhyZXEsIHJlcyk7XHJcbiAgICAgIHJlcy5zZW50Qm9keS5zaG91bGQuZXFsKHtzdGF0dXM6IDAsIHZhbHVlOiB7J2Zvbyc6J2Jhcid9fSk7XHJcbiAgICB9KTtcclxuICAgIGl0KCdzaG91bGQgcHJveHkgc3RyYW5nZSByZXNwb25zZXMnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBqID0gbW9ja1Byb3h5KHtzZXNzaW9uSWQ6ICcxMjMnfSk7XHJcbiAgICAgIGxldCBbcmVxLCByZXNdID0gYnVpbGRSZXFSZXMoJy9ub2Nocm9tZScsICdHRVQnKTtcclxuICAgICAgYXdhaXQgai5wcm94eVJlcVJlcyhyZXEsIHJlcyk7XHJcbiAgICAgIHJlcy5zZW50Q29kZS5zaG91bGQuZXF1YWwoMTAwKTtcclxuICAgICAgcmVzLnNlbnRCb2R5LnNob3VsZC5lcWwoe3N0YXR1czogMCwgdmFsdWU6IHttZXNzYWdlOiAnY2hyb21lIG5vdCByZWFjaGFibGUnfX0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn0pO1xyXG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
