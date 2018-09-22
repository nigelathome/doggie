'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function inspectObject(args) {
  function getValueArray(obj) {
    var indent = arguments.length <= 1 || arguments[1] === undefined ? '  ' : arguments[1];

    if (!_lodash2['default'].isObject(obj)) {
      return [obj];
    }

    var strArr = ['{'];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _getIterator(_lodash2['default'].toPairs(obj)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2);

        var arg = _step$value[0];
        var value = _step$value[1];

        if (!_lodash2['default'].isObject(value)) {
          strArr.push(indent + '  ' + arg + ': ' + value);
        } else {
          value = getValueArray(value, indent + '  ');
          strArr.push(indent + '  ' + arg + ': ' + value.shift());
          strArr.push.apply(strArr, _toConsumableArray(value));
        }
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

    strArr.push(indent + '}');
    return strArr;
  }
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = _getIterator(_lodash2['default'].toPairs(args)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2);

      var arg = _step2$value[0];
      var value = _step2$value[1];

      value = getValueArray(value);
      _logger2['default'].info('  ' + arg + ': ' + value.shift());
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _getIterator(value), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var val = _step3.value;

          _logger2['default'].info(val);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
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

exports.inspectObject = inspectObject;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFBYyxRQUFROzs7O3NCQUNILFVBQVU7Ozs7QUFHN0IsU0FBUyxhQUFhLENBQUUsSUFBSSxFQUFFO0FBQzVCLFdBQVMsYUFBYSxDQUFFLEdBQUcsRUFBaUI7UUFBZixNQUFNLHlEQUFHLElBQUk7O0FBQ3hDLFFBQUksQ0FBQyxvQkFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2Q7O0FBRUQsUUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBQ25CLHdDQUF5QixvQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRHQUFFOzs7WUFBL0IsR0FBRztZQUFFLEtBQUs7O0FBQ2xCLFlBQUksQ0FBQyxvQkFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdEIsZ0JBQU0sQ0FBQyxJQUFJLENBQUksTUFBTSxVQUFLLEdBQUcsVUFBSyxLQUFLLENBQUcsQ0FBQztTQUM1QyxNQUFNO0FBQ0wsZUFBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUssTUFBTSxRQUFLLENBQUM7QUFDNUMsZ0JBQU0sQ0FBQyxJQUFJLENBQUksTUFBTSxVQUFLLEdBQUcsVUFBSyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUcsQ0FBQztBQUNuRCxnQkFBTSxDQUFDLElBQUksTUFBQSxDQUFYLE1BQU0scUJBQVMsS0FBSyxFQUFDLENBQUM7U0FDdkI7T0FDRjs7Ozs7Ozs7Ozs7Ozs7OztBQUNELFVBQU0sQ0FBQyxJQUFJLENBQUksTUFBTSxPQUFJLENBQUM7QUFDMUIsV0FBTyxNQUFNLENBQUM7R0FDZjs7Ozs7O0FBQ0QsdUNBQXlCLG9CQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUhBQUU7OztVQUFoQyxHQUFHO1VBQUUsS0FBSzs7QUFDbEIsV0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QiwwQkFBTyxJQUFJLFFBQU0sR0FBRyxVQUFLLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBRyxDQUFDOzs7Ozs7QUFDMUMsMkNBQWdCLEtBQUssaUhBQUU7Y0FBZCxHQUFHOztBQUNWLDhCQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNsQjs7Ozs7Ozs7Ozs7Ozs7O0tBQ0Y7Ozs7Ozs7Ozs7Ozs7OztDQUNGOztRQUVRLGFBQWEsR0FBYixhQUFhIiwiZmlsZSI6ImxpYi91dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuXG5mdW5jdGlvbiBpbnNwZWN0T2JqZWN0IChhcmdzKSB7XG4gIGZ1bmN0aW9uIGdldFZhbHVlQXJyYXkgKG9iaiwgaW5kZW50ID0gJyAgJykge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSB7XG4gICAgICByZXR1cm4gW29ial07XG4gICAgfVxuXG4gICAgbGV0IHN0ckFyciA9IFsneyddO1xuICAgIGZvciAobGV0IFthcmcsIHZhbHVlXSBvZiBfLnRvUGFpcnMob2JqKSkge1xuICAgICAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBzdHJBcnIucHVzaChgJHtpbmRlbnR9ICAke2FyZ306ICR7dmFsdWV9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGdldFZhbHVlQXJyYXkodmFsdWUsIGAke2luZGVudH0gIGApO1xuICAgICAgICBzdHJBcnIucHVzaChgJHtpbmRlbnR9ICAke2FyZ306ICR7dmFsdWUuc2hpZnQoKX1gKTtcbiAgICAgICAgc3RyQXJyLnB1c2goLi4udmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdHJBcnIucHVzaChgJHtpbmRlbnR9fWApO1xuICAgIHJldHVybiBzdHJBcnI7XG4gIH1cbiAgZm9yIChsZXQgW2FyZywgdmFsdWVdIG9mIF8udG9QYWlycyhhcmdzKSkge1xuICAgIHZhbHVlID0gZ2V0VmFsdWVBcnJheSh2YWx1ZSk7XG4gICAgbG9nZ2VyLmluZm8oYCAgJHthcmd9OiAke3ZhbHVlLnNoaWZ0KCl9YCk7XG4gICAgZm9yIChsZXQgdmFsIG9mIHZhbHVlKSB7XG4gICAgICBsb2dnZXIuaW5mbyh2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBpbnNwZWN0T2JqZWN0IH07XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uIn0=
