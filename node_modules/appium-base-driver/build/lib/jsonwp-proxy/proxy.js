'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _appiumSupport = require('appium-support');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _jsonwpStatusStatus = require('../jsonwp-status/status');

var _mjsonwpErrors = require('../mjsonwp/errors');

var log = _appiumSupport.logger.getLogger('JSONWP Proxy');
// TODO: Make this value configurable as a server side capability
var LOG_OBJ_LENGTH = 1024; // MAX LENGTH Logged to file / console
var DEFAULT_REQUEST_TIMEOUT = 240000;

var JWProxy = (function () {
  function JWProxy() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, JWProxy);

    _Object$assign(this, {
      scheme: 'http',
      server: 'localhost',
      port: 4444,
      base: '/wd/hub',
      sessionId: null,
      timeout: DEFAULT_REQUEST_TIMEOUT
    }, opts);
    this.scheme = this.scheme.toLowerCase();
    this._activeRequests = [];
  }

  // abstract the call behind a member function
  // so that we can mock it in tests

  _createClass(JWProxy, [{
    key: 'request',
    value: function request() {
      var currentRequest,
          args$2$0 = arguments;
      return _regeneratorRuntime.async(function request$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            currentRequest = _requestPromise2['default'].apply(undefined, args$2$0);

            this._activeRequests.push(currentRequest);
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(currentRequest['finally'](function () {
              return _lodash2['default'].pull(_this._activeRequests, currentRequest);
            }));

          case 4:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getActiveRequestsCount',
    value: function getActiveRequestsCount() {
      return this._activeRequests.length;
    }
  }, {
    key: 'cancelActiveRequests',
    value: function cancelActiveRequests() {
      try {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _getIterator(this._activeRequests), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var r = _step.value;

            r.cancel();
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
      } finally {
        this._activeRequests = [];
      }
    }
  }, {
    key: 'endpointRequiresSessionId',
    value: function endpointRequiresSessionId(endpoint) {
      return !_lodash2['default'].includes(['/session', '/sessions', '/status'], endpoint);
    }
  }, {
    key: 'getUrlForProxy',
    value: function getUrlForProxy(url) {
      if (url === '') {
        url = '/';
      }
      var proxyBase = this.scheme + '://' + this.server + ':' + this.port + this.base;
      var endpointRe = '(/(session|status))';
      var remainingUrl = '';
      if (/^http/.test(url)) {
        var first = new RegExp('(https?://.+)' + endpointRe).exec(url);
        if (!first) {
          throw new Error('Got a complete url but could not extract JWP endpoint');
        }
        remainingUrl = url.replace(first[1], '');
      } else if (new RegExp('^/').test(url)) {
        remainingUrl = url;
      } else {
        throw new Error('Did not know what to do with url \'' + url + '\'');
      }

      var stripPrefixRe = new RegExp('^.+(/(session|status).*)$');
      if (stripPrefixRe.test(remainingUrl)) {
        remainingUrl = stripPrefixRe.exec(remainingUrl)[1];
      }

      if (!new RegExp(endpointRe).test(remainingUrl)) {
        remainingUrl = '/session/' + this.sessionId + remainingUrl;
      }

      var requiresSessionId = this.endpointRequiresSessionId(remainingUrl);

      if (requiresSessionId && this.sessionId === null) {
        throw new Error('Trying to proxy a session command without session id');
      }

      var sessionBaseRe = new RegExp('^/session/([^/]+)');
      if (sessionBaseRe.test(remainingUrl)) {
        // we have something like /session/:id/foobar, so we need to replace
        // the session id
        var match = sessionBaseRe.exec(remainingUrl);
        remainingUrl = remainingUrl.replace(match[1], this.sessionId);
      } else if (requiresSessionId) {
        throw new Error('Could not find :session section for url: ' + remainingUrl);
      }
      remainingUrl = remainingUrl.replace(/\/$/, ''); // can't have trailing slashes
      return proxyBase + remainingUrl;
    }
  }, {
    key: 'proxy',
    value: function proxy(url, method) {
      var body = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
      var newUrl, reqOpts, res, resBody, responseError;
      return _regeneratorRuntime.async(function proxy$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            method = method.toUpperCase();
            newUrl = this.getUrlForProxy(url);
            reqOpts = {
              url: newUrl,
              method: method,
              headers: {
                'Content-type': 'application/json',
                'user-agent': 'appium',
                accept: '*/*'
              },
              resolveWithFullResponse: true,
              timeout: this.timeout,
              forever: true
            };

            if (body !== null) {
              if (typeof body !== 'object') {
                body = JSON.parse(body);
              }
              reqOpts.json = body;
            }

            // GET methods shouldn't have any body. Most servers are OK with this, but WebDriverAgent throws 400 errors
            if (method === 'GET') {
              reqOpts.json = null;
            }

            log.debug('Proxying [' + method + ' ' + (url || "/") + '] to [' + method + ' ' + newUrl + '] ' + (body ? 'with body: ' + _lodash2['default'].truncate(JSON.stringify(body), { length: LOG_OBJ_LENGTH }) : 'with no body'));

            res = undefined, resBody = undefined;
            context$2$0.prev = 7;
            context$2$0.next = 10;
            return _regeneratorRuntime.awrap(this.request(reqOpts));

          case 10:
            res = context$2$0.sent;

            resBody = res.body;
            log.debug('Got response with status ' + res.statusCode + ': ' + _lodash2['default'].truncate(JSON.stringify(resBody), { length: LOG_OBJ_LENGTH }));
            if (/\/session$/.test(url) && method === 'POST') {
              if (res.statusCode === 200) {
                this.sessionId = resBody.sessionId;
              } else if (res.statusCode === 303) {
                this.sessionId = /\/session\/([^\/]+)/.exec(resBody)[1];
              }
            }
            context$2$0.next = 21;
            break;

          case 16:
            context$2$0.prev = 16;
            context$2$0.t0 = context$2$0['catch'](7);
            responseError = undefined;

            try {
              responseError = JSON.parse(context$2$0.t0.error);
            } catch (e1) {
              if (_lodash2['default'].isString(context$2$0.t0.error) && context$2$0.t0.error.length) {
                log.warn('Got unexpected response: ' + _lodash2['default'].truncate(context$2$0.t0.error, { length: 300 }));
              }
              responseError = _lodash2['default'].isPlainObject(context$2$0.t0.error) ? context$2$0.t0.error : null;
            }
            throw new _mjsonwpErrors.errors.ProxyRequestError('Could not proxy command to remote server. ' + ('Original error: ' + context$2$0.t0.message), responseError);

          case 21:
            return context$2$0.abrupt('return', [res, resBody]);

          case 22:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[7, 16]]);
    }
  }, {
    key: 'command',
    value: function command(url, method) {
      var body = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var _ref, _ref2, response, resBody, statusCodesWithRes, message, e;

      return _regeneratorRuntime.async(function command$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.proxy(url, method, body));

          case 2:
            _ref = context$2$0.sent;
            _ref2 = _slicedToArray(_ref, 2);
            response = _ref2[0];
            resBody = _ref2[1];
            statusCodesWithRes = [100, 200, 500];

            resBody = _appiumSupport.util.safeJsonParse(resBody);

            if (!(_lodash2['default'].includes(statusCodesWithRes, response.statusCode) && (_lodash2['default'].isUndefined(resBody.status) || _lodash2['default'].isUndefined(resBody.value)))) {
              context$2$0.next = 10;
              break;
            }

            throw new Error('Did not get a valid response object. Object was: ' + JSON.stringify(resBody));

          case 10:
            if (!_lodash2['default'].includes(statusCodesWithRes, response.statusCode)) {
              context$2$0.next = 24;
              break;
            }

            if (!(response.statusCode === 200 && resBody.status === 0)) {
              context$2$0.next = 15;
              break;
            }

            return context$2$0.abrupt('return', resBody.value);

          case 15:
            if (!(response.statusCode === 200 && _lodash2['default'].isUndefined(resBody.status))) {
              context$2$0.next = 17;
              break;
            }

            return context$2$0.abrupt('return', resBody);

          case 17:
            message = (0, _jsonwpStatusStatus.getSummaryByCode)(resBody.status);

            if (resBody.value.message) {
              message += ' (Original error: ' + resBody.value.message + ')';
            }
            e = new Error(message);

            e.status = resBody.status;
            e.value = resBody.value;
            e.httpCode = response.statusCode;
            throw e;

          case 24:
            throw new Error('Didn\'t know what to do with response code \'' + response.statusCode + '\'');

          case 25:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getSessionIdFromUrl',
    value: function getSessionIdFromUrl(url) {
      var match = url.match(/\/session\/([^\/]+)/);
      return match ? match[1] : null;
    }
  }, {
    key: 'proxyReqRes',
    value: function proxyReqRes(req, res) {
      var _ref3, _ref32, response, body, reqSessionId;

      return _regeneratorRuntime.async(function proxyReqRes$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.proxy(req.originalUrl, req.method, req.body));

          case 2:
            _ref3 = context$2$0.sent;
            _ref32 = _slicedToArray(_ref3, 2);
            response = _ref32[0];
            body = _ref32[1];

            res.headers = response.headers;
            res.set('Content-type', response.headers['content-type']);
            // if the proxied response contains a sessionId that the downstream
            // driver has generated, we don't want to return that to the client.
            // Instead, return the id from the request or from current session
            body = _appiumSupport.util.safeJsonParse(body);
            if (body && body.sessionId) {
              reqSessionId = this.getSessionIdFromUrl(req.originalUrl);

              if (reqSessionId) {
                log.info('Replacing sessionId ' + body.sessionId + ' with ' + reqSessionId);
                body.sessionId = reqSessionId;
              } else if (this.sessionId) {
                log.info('Replacing sessionId ' + body.sessionId + ' with ' + this.sessionId);
                body.sessionId = this.sessionId;
              }
            }
            res.status(response.statusCode).send(JSON.stringify(body));

          case 11:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return JWProxy;
})();

exports['default'] = JWProxy;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qc29ud3AtcHJveHkvcHJveHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQWMsUUFBUTs7Ozs2QkFDTyxnQkFBZ0I7OzhCQUN6QixpQkFBaUI7Ozs7a0NBQ0oseUJBQXlCOzs2QkFDbkMsbUJBQW1COztBQUcxQyxJQUFNLEdBQUcsR0FBRyxzQkFBTyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRTdDLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQztBQUM1QixJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQzs7SUFFakMsT0FBTztBQUNDLFdBRFIsT0FBTyxHQUNhO1FBQVgsSUFBSSx5REFBRyxFQUFFOzswQkFEbEIsT0FBTzs7QUFFVCxtQkFBYyxJQUFJLEVBQUU7QUFDbEIsWUFBTSxFQUFFLE1BQU07QUFDZCxZQUFNLEVBQUUsV0FBVztBQUNuQixVQUFJLEVBQUUsSUFBSTtBQUNWLFVBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxFQUFFLElBQUk7QUFDZixhQUFPLEVBQUUsdUJBQXVCO0tBQ2pDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDVCxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDeEMsUUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7R0FDM0I7Ozs7O2VBWkcsT0FBTzs7V0FnQkc7VUFDTixjQUFjOzs7Ozs7O0FBQWQsMEJBQWMsR0FBRyxzREFBZ0I7O0FBQ3ZDLGdCQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzs7NkNBQzdCLGNBQWMsV0FBUSxDQUFDO3FCQUFNLG9CQUFFLElBQUksQ0FBQyxNQUFLLGVBQWUsRUFBRSxjQUFjLENBQUM7YUFBQSxDQUFDOzs7Ozs7Ozs7O0tBQ3hGOzs7V0FFc0Isa0NBQUc7QUFDeEIsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztLQUNwQzs7O1dB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QkFBSyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsZ0JBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDcEIsMEJBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7QUFDOUQsa0JBQUksWUFBWSxFQUFFO0FBQ2hCLG1CQUFHLENBQUMsSUFBSSwwQkFBd0IsSUFBSSxDQUFDLFNBQVMsY0FBUyxZQUFZLENBQUcsQ0FBQztBQUN2RSxvQkFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7ZUFDL0IsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDekIsbUJBQUcsQ0FBQyxJQUFJLDBCQUF3QixJQUFJLENBQUMsU0FBUyxjQUFTLElBQUksQ0FBQyxTQUFTLENBQUcsQ0FBQztBQUN6RSxvQkFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2VBQ2pDO2FBQ0Y7QUFDRCxlQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0tBQzVEOzs7U0FwTUcsT0FBTzs7O3FCQXVNRSxPQUFPIiwiZmlsZSI6ImxpYi9qc29ud3AtcHJveHkvcHJveHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgbG9nZ2VyLCB1dGlsIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcbmltcG9ydCB7IGdldFN1bW1hcnlCeUNvZGUgfSBmcm9tICcuLi9qc29ud3Atc3RhdHVzL3N0YXR1cyc7XG5pbXBvcnQgeyBlcnJvcnMgfSBmcm9tICcuLi9tanNvbndwL2Vycm9ycyc7XG5cblxuY29uc3QgbG9nID0gbG9nZ2VyLmdldExvZ2dlcignSlNPTldQIFByb3h5Jyk7XG4vLyBUT0RPOiBNYWtlIHRoaXMgdmFsdWUgY29uZmlndXJhYmxlIGFzIGEgc2VydmVyIHNpZGUgY2FwYWJpbGl0eVxuY29uc3QgTE9HX09CSl9MRU5HVEggPSAxMDI0OyAvLyBNQVggTEVOR1RIIExvZ2dlZCB0byBmaWxlIC8gY29uc29sZVxuY29uc3QgREVGQVVMVF9SRVFVRVNUX1RJTUVPVVQgPSAyNDAwMDA7XG5cbmNsYXNzIEpXUHJveHkge1xuICBjb25zdHJ1Y3RvciAob3B0cyA9IHt9KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICBzY2hlbWU6ICdodHRwJyxcbiAgICAgIHNlcnZlcjogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0OiA0NDQ0LFxuICAgICAgYmFzZTogJy93ZC9odWInLFxuICAgICAgc2Vzc2lvbklkOiBudWxsLFxuICAgICAgdGltZW91dDogREVGQVVMVF9SRVFVRVNUX1RJTUVPVVQsXG4gICAgfSwgb3B0cyk7XG4gICAgdGhpcy5zY2hlbWUgPSB0aGlzLnNjaGVtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMuX2FjdGl2ZVJlcXVlc3RzID0gW107XG4gIH1cblxuICAvLyBhYnN0cmFjdCB0aGUgY2FsbCBiZWhpbmQgYSBtZW1iZXIgZnVuY3Rpb25cbiAgLy8gc28gdGhhdCB3ZSBjYW4gbW9jayBpdCBpbiB0ZXN0c1xuICBhc3luYyByZXF1ZXN0ICguLi5hcmdzKSB7XG4gICAgY29uc3QgY3VycmVudFJlcXVlc3QgPSByZXF1ZXN0KC4uLmFyZ3MpO1xuICAgIHRoaXMuX2FjdGl2ZVJlcXVlc3RzLnB1c2goY3VycmVudFJlcXVlc3QpO1xuICAgIHJldHVybiBhd2FpdCBjdXJyZW50UmVxdWVzdC5maW5hbGx5KCgpID0+IF8ucHVsbCh0aGlzLl9hY3RpdmVSZXF1ZXN0cywgY3VycmVudFJlcXVlc3QpKTtcbiAgfVxuXG4gIGdldEFjdGl2ZVJlcXVlc3RzQ291bnQgKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVSZXF1ZXN0cy5sZW5ndGg7XG4gIH1cblxuICBjYW5jZWxBY3RpdmVSZXF1ZXN0cyAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAobGV0IHIgb2YgdGhpcy5fYWN0aXZlUmVxdWVzdHMpIHtcbiAgICAgICAgci5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fYWN0aXZlUmVxdWVzdHMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBlbmRwb2ludFJlcXVpcmVzU2Vzc2lvbklkIChlbmRwb2ludCkge1xuICAgIHJldHVybiAhXy5pbmNsdWRlcyhbJy9zZXNzaW9uJywgJy9zZXNzaW9ucycsICcvc3RhdHVzJ10sIGVuZHBvaW50KTtcbiAgfVxuXG4gIGdldFVybEZvclByb3h5ICh1cmwpIHtcbiAgICBpZiAodXJsID09PSAnJykge1xuICAgICAgdXJsID0gJy8nO1xuICAgIH1cbiAgICBjb25zdCBwcm94eUJhc2UgPSBgJHt0aGlzLnNjaGVtZX06Ly8ke3RoaXMuc2VydmVyfToke3RoaXMucG9ydH0ke3RoaXMuYmFzZX1gO1xuICAgIGNvbnN0IGVuZHBvaW50UmUgPSAnKC8oc2Vzc2lvbnxzdGF0dXMpKSc7XG4gICAgbGV0IHJlbWFpbmluZ1VybCA9ICcnO1xuICAgIGlmICgvXmh0dHAvLnRlc3QodXJsKSkge1xuICAgICAgY29uc3QgZmlyc3QgPSAobmV3IFJlZ0V4cChgKGh0dHBzPzovLy4rKSR7ZW5kcG9pbnRSZX1gKSkuZXhlYyh1cmwpO1xuICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dvdCBhIGNvbXBsZXRlIHVybCBidXQgY291bGQgbm90IGV4dHJhY3QgSldQIGVuZHBvaW50Jyk7XG4gICAgICB9XG4gICAgICByZW1haW5pbmdVcmwgPSB1cmwucmVwbGFjZShmaXJzdFsxXSwgJycpO1xuICAgIH0gZWxzZSBpZiAoKG5ldyBSZWdFeHAoJ14vJykpLnRlc3QodXJsKSkge1xuICAgICAgcmVtYWluaW5nVXJsID0gdXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpZCBub3Qga25vdyB3aGF0IHRvIGRvIHdpdGggdXJsICcke3VybH0nYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaXBQcmVmaXhSZSA9IG5ldyBSZWdFeHAoJ14uKygvKHNlc3Npb258c3RhdHVzKS4qKSQnKTtcbiAgICBpZiAoc3RyaXBQcmVmaXhSZS50ZXN0KHJlbWFpbmluZ1VybCkpIHtcbiAgICAgIHJlbWFpbmluZ1VybCA9IHN0cmlwUHJlZml4UmUuZXhlYyhyZW1haW5pbmdVcmwpWzFdO1xuICAgIH1cblxuICAgIGlmICghKG5ldyBSZWdFeHAoZW5kcG9pbnRSZSkpLnRlc3QocmVtYWluaW5nVXJsKSkge1xuICAgICAgcmVtYWluaW5nVXJsID0gYC9zZXNzaW9uLyR7dGhpcy5zZXNzaW9uSWR9JHtyZW1haW5pbmdVcmx9YDtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1aXJlc1Nlc3Npb25JZCA9IHRoaXMuZW5kcG9pbnRSZXF1aXJlc1Nlc3Npb25JZChyZW1haW5pbmdVcmwpO1xuXG4gICAgaWYgKHJlcXVpcmVzU2Vzc2lvbklkICYmIHRoaXMuc2Vzc2lvbklkID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBwcm94eSBhIHNlc3Npb24gY29tbWFuZCB3aXRob3V0IHNlc3Npb24gaWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZXNzaW9uQmFzZVJlID0gbmV3IFJlZ0V4cCgnXi9zZXNzaW9uLyhbXi9dKyknKTtcbiAgICBpZiAoc2Vzc2lvbkJhc2VSZS50ZXN0KHJlbWFpbmluZ1VybCkpIHtcbiAgICAgIC8vIHdlIGhhdmUgc29tZXRoaW5nIGxpa2UgL3Nlc3Npb24vOmlkL2Zvb2Jhciwgc28gd2UgbmVlZCB0byByZXBsYWNlXG4gICAgICAvLyB0aGUgc2Vzc2lvbiBpZFxuICAgICAgY29uc3QgbWF0Y2ggPSBzZXNzaW9uQmFzZVJlLmV4ZWMocmVtYWluaW5nVXJsKTtcbiAgICAgIHJlbWFpbmluZ1VybCA9IHJlbWFpbmluZ1VybC5yZXBsYWNlKG1hdGNoWzFdLCB0aGlzLnNlc3Npb25JZCk7XG4gICAgfSBlbHNlIGlmIChyZXF1aXJlc1Nlc3Npb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCA6c2Vzc2lvbiBzZWN0aW9uIGZvciB1cmw6ICR7cmVtYWluaW5nVXJsfWApO1xuICAgIH1cbiAgICByZW1haW5pbmdVcmwgPSByZW1haW5pbmdVcmwucmVwbGFjZSgvXFwvJC8sICcnKTsgLy8gY2FuJ3QgaGF2ZSB0cmFpbGluZyBzbGFzaGVzXG4gICAgcmV0dXJuIHByb3h5QmFzZSArIHJlbWFpbmluZ1VybDtcbiAgfVxuXG4gIGFzeW5jIHByb3h5ICh1cmwsIG1ldGhvZCwgYm9keSA9IG51bGwpIHtcbiAgICBtZXRob2QgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICBjb25zdCBuZXdVcmwgPSB0aGlzLmdldFVybEZvclByb3h5KHVybCk7XG4gICAgY29uc3QgcmVxT3B0cyA9IHtcbiAgICAgIHVybDogbmV3VXJsLFxuICAgICAgbWV0aG9kLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAndXNlci1hZ2VudCc6ICdhcHBpdW0nLFxuICAgICAgICBhY2NlcHQ6ICcqLyonLFxuICAgICAgfSxcbiAgICAgIHJlc29sdmVXaXRoRnVsbFJlc3BvbnNlOiB0cnVlLFxuICAgICAgdGltZW91dDogdGhpcy50aW1lb3V0LFxuICAgICAgZm9yZXZlcjogdHJ1ZSxcbiAgICB9O1xuICAgIGlmIChib2R5ICE9PSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGJvZHkgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgfVxuICAgICAgcmVxT3B0cy5qc29uID0gYm9keTtcbiAgICB9XG5cbiAgICAvLyBHRVQgbWV0aG9kcyBzaG91bGRuJ3QgaGF2ZSBhbnkgYm9keS4gTW9zdCBzZXJ2ZXJzIGFyZSBPSyB3aXRoIHRoaXMsIGJ1dCBXZWJEcml2ZXJBZ2VudCB0aHJvd3MgNDAwIGVycm9yc1xuICAgIGlmIChtZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICByZXFPcHRzLmpzb24gPSBudWxsO1xuICAgIH1cblxuICAgIGxvZy5kZWJ1ZyhgUHJveHlpbmcgWyR7bWV0aG9kfSAke3VybCB8fCBcIi9cIn1dIHRvIFske21ldGhvZH0gJHtuZXdVcmx9XSBgICtcbiAgICAgICAgICAgICAoYm9keSA/IGB3aXRoIGJvZHk6ICR7Xy50cnVuY2F0ZShKU09OLnN0cmluZ2lmeShib2R5KSwge2xlbmd0aDogTE9HX09CSl9MRU5HVEh9KX1gIDogJ3dpdGggbm8gYm9keScpKTtcblxuICAgIGxldCByZXMsIHJlc0JvZHk7XG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IGF3YWl0IHRoaXMucmVxdWVzdChyZXFPcHRzKTtcbiAgICAgIHJlc0JvZHkgPSByZXMuYm9keTtcbiAgICAgIGxvZy5kZWJ1ZyhgR290IHJlc3BvbnNlIHdpdGggc3RhdHVzICR7cmVzLnN0YXR1c0NvZGV9OiAke18udHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkocmVzQm9keSksIHtsZW5ndGg6IExPR19PQkpfTEVOR1RIfSl9YCk7XG4gICAgICBpZiAoL1xcL3Nlc3Npb24kLy50ZXN0KHVybCkgJiYgbWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgICB0aGlzLnNlc3Npb25JZCA9IHJlc0JvZHkuc2Vzc2lvbklkO1xuICAgICAgICB9IGVsc2UgaWYgKHJlcy5zdGF0dXNDb2RlID09PSAzMDMpIHtcbiAgICAgICAgICB0aGlzLnNlc3Npb25JZCA9IC9cXC9zZXNzaW9uXFwvKFteXFwvXSspLy5leGVjKHJlc0JvZHkpWzFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbGV0IHJlc3BvbnNlRXJyb3I7XG4gICAgICB0cnkge1xuICAgICAgICByZXNwb25zZUVycm9yID0gSlNPTi5wYXJzZShlLmVycm9yKTtcbiAgICAgIH0gY2F0Y2ggKGUxKSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGUuZXJyb3IpICYmIGUuZXJyb3IubGVuZ3RoKSB7XG4gICAgICAgICAgbG9nLndhcm4oYEdvdCB1bmV4cGVjdGVkIHJlc3BvbnNlOiAke18udHJ1bmNhdGUoZS5lcnJvciwge2xlbmd0aDogMzAwfSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uc2VFcnJvciA9IF8uaXNQbGFpbk9iamVjdChlLmVycm9yKSA/IGUuZXJyb3IgOiBudWxsO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IGVycm9ycy5Qcm94eVJlcXVlc3RFcnJvcihgQ291bGQgbm90IHByb3h5IGNvbW1hbmQgdG8gcmVtb3RlIHNlcnZlci4gYCAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7ZS5tZXNzYWdlfWAsIHJlc3BvbnNlRXJyb3IpO1xuICAgIH1cbiAgICByZXR1cm4gW3JlcywgcmVzQm9keV07XG4gIH1cblxuICBhc3luYyBjb21tYW5kICh1cmwsIG1ldGhvZCwgYm9keSA9IG51bGwpIHtcbiAgICBsZXQgW3Jlc3BvbnNlLCByZXNCb2R5XSA9IGF3YWl0IHRoaXMucHJveHkodXJsLCBtZXRob2QsIGJvZHkpO1xuICAgIGxldCBzdGF0dXNDb2Rlc1dpdGhSZXMgPSBbMTAwLCAyMDAsIDUwMF07XG4gICAgcmVzQm9keSA9IHV0aWwuc2FmZUpzb25QYXJzZShyZXNCb2R5KTtcbiAgICBpZiAoXy5pbmNsdWRlcyhzdGF0dXNDb2Rlc1dpdGhSZXMsIHJlc3BvbnNlLnN0YXR1c0NvZGUpICYmXG4gICAgICAgIChfLmlzVW5kZWZpbmVkKHJlc0JvZHkuc3RhdHVzKSB8fCBfLmlzVW5kZWZpbmVkKHJlc0JvZHkudmFsdWUpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaWQgbm90IGdldCBhIHZhbGlkIHJlc3BvbnNlIG9iamVjdC4gT2JqZWN0IHdhczogJHtKU09OLnN0cmluZ2lmeShyZXNCb2R5KX1gKTtcbiAgICB9XG4gICAgaWYgKF8uaW5jbHVkZXMoc3RhdHVzQ29kZXNXaXRoUmVzLCByZXNwb25zZS5zdGF0dXNDb2RlKSkge1xuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCAmJiByZXNCb2R5LnN0YXR1cyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcmVzQm9keS52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwICYmIF8uaXNVbmRlZmluZWQocmVzQm9keS5zdGF0dXMpKSB7XG4gICAgICAgIHJldHVybiByZXNCb2R5O1xuICAgICAgfVxuICAgICAgbGV0IG1lc3NhZ2UgPSBnZXRTdW1tYXJ5QnlDb2RlKHJlc0JvZHkuc3RhdHVzKTtcbiAgICAgIGlmIChyZXNCb2R5LnZhbHVlLm1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZSArPSBgIChPcmlnaW5hbCBlcnJvcjogJHtyZXNCb2R5LnZhbHVlLm1lc3NhZ2V9KWA7XG4gICAgICB9XG4gICAgICBsZXQgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgIGUuc3RhdHVzID0gcmVzQm9keS5zdGF0dXM7XG4gICAgICBlLnZhbHVlID0gcmVzQm9keS52YWx1ZTtcbiAgICAgIGUuaHR0cENvZGUgPSByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBEaWRuJ3Qga25vdyB3aGF0IHRvIGRvIHdpdGggcmVzcG9uc2UgY29kZSAnJHtyZXNwb25zZS5zdGF0dXNDb2RlfSdgKTtcbiAgfVxuXG4gIGdldFNlc3Npb25JZEZyb21VcmwgKHVybCkge1xuICAgIGNvbnN0IG1hdGNoID0gdXJsLm1hdGNoKC9cXC9zZXNzaW9uXFwvKFteXFwvXSspLyk7XG4gICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xuICB9XG5cbiAgYXN5bmMgcHJveHlSZXFSZXMgKHJlcSwgcmVzKSB7XG4gICAgbGV0IFtyZXNwb25zZSwgYm9keV0gPSBhd2FpdCB0aGlzLnByb3h5KHJlcS5vcmlnaW5hbFVybCwgcmVxLm1ldGhvZCwgcmVxLmJvZHkpO1xuICAgIHJlcy5oZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycztcbiAgICByZXMuc2V0KCdDb250ZW50LXR5cGUnLCByZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSk7XG4gICAgLy8gaWYgdGhlIHByb3hpZWQgcmVzcG9uc2UgY29udGFpbnMgYSBzZXNzaW9uSWQgdGhhdCB0aGUgZG93bnN0cmVhbVxuICAgIC8vIGRyaXZlciBoYXMgZ2VuZXJhdGVkLCB3ZSBkb24ndCB3YW50IHRvIHJldHVybiB0aGF0IHRvIHRoZSBjbGllbnQuXG4gICAgLy8gSW5zdGVhZCwgcmV0dXJuIHRoZSBpZCBmcm9tIHRoZSByZXF1ZXN0IG9yIGZyb20gY3VycmVudCBzZXNzaW9uXG4gICAgYm9keSA9IHV0aWwuc2FmZUpzb25QYXJzZShib2R5KTtcbiAgICBpZiAoYm9keSAmJiBib2R5LnNlc3Npb25JZCkge1xuICAgICAgY29uc3QgcmVxU2Vzc2lvbklkID0gdGhpcy5nZXRTZXNzaW9uSWRGcm9tVXJsKHJlcS5vcmlnaW5hbFVybCk7XG4gICAgICBpZiAocmVxU2Vzc2lvbklkKSB7XG4gICAgICAgIGxvZy5pbmZvKGBSZXBsYWNpbmcgc2Vzc2lvbklkICR7Ym9keS5zZXNzaW9uSWR9IHdpdGggJHtyZXFTZXNzaW9uSWR9YCk7XG4gICAgICAgIGJvZHkuc2Vzc2lvbklkID0gcmVxU2Vzc2lvbklkO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnNlc3Npb25JZCkge1xuICAgICAgICBsb2cuaW5mbyhgUmVwbGFjaW5nIHNlc3Npb25JZCAke2JvZHkuc2Vzc2lvbklkfSB3aXRoICR7dGhpcy5zZXNzaW9uSWR9YCk7XG4gICAgICAgIGJvZHkuc2Vzc2lvbklkID0gdGhpcy5zZXNzaW9uSWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJlcy5zdGF0dXMocmVzcG9uc2Uuc3RhdHVzQ29kZSkuc2VuZChKU09OLnN0cmluZ2lmeShib2R5KSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSldQcm94eTtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
