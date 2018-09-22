'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _appiumSupport = require('appium-support');

var _teen_process = require('teen_process');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var ZIP_EXTS = ['.zip', '.ipa'];
var ZIP_MIME_TYPE = 'application/zip';

function configureApp(app, appExt) {
  var mountRoot = arguments.length <= 2 || arguments[2] === undefined ? "Volumes" : arguments[2];
  var windowsShareUserName = arguments.length <= 3 || arguments[3] === undefined ? "" : arguments[3];
  var windowsSharePassword = arguments.length <= 4 || arguments[4] === undefined ? "" : arguments[4];

  var newApp, shouldUnzipApp, _ref, targetPath, contentType, archivePath;

  return _regeneratorRuntime.async(function configureApp$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_lodash2['default'].isString(app)) {
          context$1$0.next = 2;
          break;
        }

        return context$1$0.abrupt('return');

      case 2:
        newApp = app;
        shouldUnzipApp = false;

        if (!newApp.startsWith("\\")) {
          context$1$0.next = 8;
          break;
        }

        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(copyFromWindowsNetworkShare(newApp, appExt, mountRoot, windowsShareUserName, windowsSharePassword));

      case 7:
        newApp = context$1$0.sent;

      case 8:
        if (!(newApp.startsWith('http') && newApp.includes('://'))) {
          context$1$0.next = 20;
          break;
        }

        _logger2['default'].info('Using downloadable app \'' + newApp + '\'');
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(downloadApp(newApp, appExt));

      case 12:
        _ref = context$1$0.sent;
        targetPath = _ref.targetPath;
        contentType = _ref.contentType;

        newApp = targetPath;
        // the filetype may not be obvious for certain urls, so check the mime type too
        shouldUnzipApp = _lodash2['default'].includes(ZIP_EXTS, _path2['default'].extname(newApp)) || contentType === ZIP_MIME_TYPE;
        _logger2['default'].info('Downloaded app to \'' + newApp + '\'');
        context$1$0.next = 34;
        break;

      case 20:
        _logger2['default'].info('Using local app \'' + newApp + '\'');
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(newApp));

      case 23:
        if (context$1$0.sent) {
          context$1$0.next = 25;
          break;
        }

        throw new Error('The application at \'' + newApp + '\' does not exist or is not accessible');

      case 25:
        shouldUnzipApp = _lodash2['default'].includes(ZIP_EXTS, _path2['default'].extname(newApp));

        if (!shouldUnzipApp) {
          context$1$0.next = 32;
          break;
        }

        context$1$0.next = 29;
        return _regeneratorRuntime.awrap(copyLocalZip(newApp));

      case 29:
        context$1$0.t0 = context$1$0.sent;
        context$1$0.next = 33;
        break;

      case 32:
        context$1$0.t0 = newApp;

      case 33:
        newApp = context$1$0.t0;

      case 34:
        if (!shouldUnzipApp) {
          context$1$0.next = 46;
          break;
        }

        _logger2['default'].info('Unzipping local app \'' + newApp + '\'...');
        archivePath = newApp;
        context$1$0.prev = 37;
        context$1$0.next = 40;
        return _regeneratorRuntime.awrap(unzipApp(archivePath, appExt));

      case 40:
        newApp = context$1$0.sent;

      case 41:
        context$1$0.prev = 41;
        context$1$0.next = 44;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(archivePath));

      case 44:
        return context$1$0.finish(41);

      case 45:
        _logger2['default'].info('Unzipped local app to \'' + newApp + '\'');

      case 46:
        if (!(_path2['default'].extname(newApp) !== appExt)) {
          context$1$0.next = 51;
          break;
        }

        if (!(newApp !== app)) {
          context$1$0.next = 50;
          break;
        }

        context$1$0.next = 50;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(newApp));

      case 50:
        throw new Error('New app path ' + newApp + ' did not have extension ' + appExt);

      case 51:
        return context$1$0.abrupt('return', newApp);

      case 52:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[37,, 41, 45]]);
}

function downloadApp(app, appExt) {
  var appUrl, isZipFile, downloadedApp;
  return _regeneratorRuntime.async(function downloadApp$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        appUrl = undefined;
        context$1$0.prev = 1;

        appUrl = _url2['default'].parse(app);
        context$1$0.next = 8;
        break;

      case 5:
        context$1$0.prev = 5;
        context$1$0.t0 = context$1$0['catch'](1);
        throw new Error('Invalid App URL (' + app + ')');

      case 8:
        isZipFile = _lodash2['default'].includes(ZIP_EXTS, _path2['default'].extname(appUrl.pathname));

        appExt = isZipFile ? '.zip' : appExt;

        downloadedApp = undefined;
        context$1$0.prev = 11;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(downloadFile(_url2['default'].format(appUrl), appExt));

      case 14:
        downloadedApp = context$1$0.sent;
        context$1$0.next = 20;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t1 = context$1$0['catch'](11);
        throw new Error('Problem downloading app from url ' + app + ': ' + context$1$0.t1);

      case 20:
        return context$1$0.abrupt('return', downloadedApp);

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 5], [11, 17]]);
}

function downloadFile(sourceUrl, suffix) {
  var targetPath, contentType;
  return _regeneratorRuntime.async(function downloadFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.path({ prefix: 'appium-app', suffix: suffix }));

      case 2:
        targetPath = context$1$0.sent;
        contentType = undefined;
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(new _bluebird2['default'](function (resolve, reject) {
          (0, _request2['default'])(sourceUrl).on('error', reject) // handle real errors, like connection errors
          .on('response', function (res) {
            // handle responses that fail, like 404s
            if (res.statusCode >= 400) {
              reject('Error downloading file: ' + res.statusCode);
            }
            contentType = res.headers['content-type'];
          }).pipe(_fs3['default'].createWriteStream(targetPath)).on('error', reject).on('close', resolve);
        }));

      case 6:
        _logger2['default'].debug(sourceUrl + ' downloaded to ' + targetPath);
        _logger2['default'].debug('Downloaded file type \'' + contentType + '\'');
        return context$1$0.abrupt('return', { targetPath: targetPath, contentType: contentType });

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function copyLocalZip(localZipPath) {
  var fileInfo, infile, outfile;
  return _regeneratorRuntime.async(function copyLocalZip$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Copying local zip to tmp dir');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(localZipPath));

      case 3:
        if (context$1$0.sent) {
          context$1$0.next = 5;
          break;
        }

        throw new Error('Local zip did not exist');

      case 5:
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.open({ prefix: 'appium-app', suffix: '.zip' }));

      case 7:
        fileInfo = context$1$0.sent;
        infile = _fs3['default'].createReadStream(localZipPath);
        outfile = _fs3['default'].createWriteStream(fileInfo.path);
        return context$1$0.abrupt('return', new _bluebird2['default'](function (resolve, reject) {
          infile.pipe(outfile).on('close', function () {
            resolve(fileInfo.path);
          }).on('error', function (err) {
            // eslint-disable-line promise/prefer-await-to-callbacks
            reject(err);
          });
        }));

      case 11:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function unzipApp(zipPath, appExt) {
  var _ref2,
  // first delete any existing apps that might be in our tmp dir
  stdout, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line, output, relaxedRegStr, strictReg, relaxedReg, strictMatch, relaxedMatch, getAppPath;

  return _regeneratorRuntime.async(function unzipApp$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('find', [_path2['default'].dirname(zipPath), '-type', 'd', '-name', '*' + appExt]));

      case 2:
        _ref2 = context$1$0.sent;
        stdout = _ref2.stdout;
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 7;
        _iterator = _getIterator(stdout.trim().split('\n').filter(Boolean));

      case 9:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 16;
          break;
        }

        line = _step.value;
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(line));

      case 13:
        _iteratorNormalCompletion = true;
        context$1$0.next = 9;
        break;

      case 16:
        context$1$0.next = 22;
        break;

      case 18:
        context$1$0.prev = 18;
        context$1$0.t0 = context$1$0['catch'](7);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 22:
        context$1$0.prev = 22;
        context$1$0.prev = 23;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 25:
        context$1$0.prev = 25;

        if (!_didIteratorError) {
          context$1$0.next = 28;
          break;
        }

        throw _iteratorError;

      case 28:
        return context$1$0.finish(25);

      case 29:
        return context$1$0.finish(22);

      case 30:
        context$1$0.next = 32;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(_path2['default'].resolve(_path2['default'].dirname(zipPath), 'Payload*')));

      case 32:
        context$1$0.next = 34;
        return _regeneratorRuntime.awrap(unzipFile(zipPath));

      case 34:
        output = context$1$0.sent;
        relaxedRegStr = '(?:creating|inflating|extracting): (.+' + appExt + ')/?';
        strictReg = new RegExp(relaxedRegStr + '$', 'm');
        relaxedReg = new RegExp(relaxedRegStr, 'm');
        strictMatch = strictReg.exec(output);
        relaxedMatch = relaxedReg.exec(output);

        getAppPath = function getAppPath(match) {
          return _path2['default'].resolve(_path2['default'].dirname(zipPath), match[1]);
        };

        if (!strictMatch) {
          context$1$0.next = 43;
          break;
        }

        return context$1$0.abrupt('return', getAppPath(strictMatch));

      case 43:
        if (!relaxedMatch) {
          context$1$0.next = 46;
          break;
        }

        _logger2['default'].debug('Got a relaxed match for app in zip, be careful for app match errors');
        return context$1$0.abrupt('return', getAppPath(relaxedMatch));

      case 46:
        throw new Error('App zip unzipped OK, but we could not find a ' + appExt + ' bundle ' + ('in it. Make sure your archive contains the ' + appExt + ' package ') + 'and nothing else');

      case 47:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[7, 18, 22, 30], [23,, 25, 29]]);
}

function unzipFile(zipPath) {
  var valid, execEnv, execOpts, _ref3, stdout;

  return _regeneratorRuntime.async(function unzipFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Unzipping ' + zipPath);
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(testZipArchive(zipPath));

      case 3:
        valid = context$1$0.sent;

        if (valid) {
          context$1$0.next = 6;
          break;
        }

        throw new Error('Zip archive ' + zipPath + ' did not test valid');

      case 6:
        if (!_appiumSupport.system.isWindows()) {
          context$1$0.next = 11;
          break;
        }

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(_appiumSupport.zip.extractAllTo(zipPath, _path2['default'].dirname(zipPath)));

      case 9:
        _logger2['default'].debug('Unzip successful');
        return context$1$0.abrupt('return');

      case 11:
        execEnv = _lodash2['default'].clone(process.env);

        delete execEnv.UNZIP;
        execOpts = { cwd: _path2['default'].dirname(zipPath), env: execEnv };
        context$1$0.prev = 14;
        context$1$0.next = 17;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('unzip', ['-o', zipPath], execOpts));

      case 17:
        _ref3 = context$1$0.sent;
        stdout = _ref3.stdout;
        return context$1$0.abrupt('return', stdout);

      case 22:
        context$1$0.prev = 22;
        context$1$0.t0 = context$1$0['catch'](14);

        _logger2['default'].error('Unzip threw error ' + context$1$0.t0);
        _logger2['default'].error('Stderr: ' + context$1$0.t0.stderr);
        _logger2['default'].error('Stdout: ' + context$1$0.t0.stdout);
        throw new Error('Archive could not be unzipped, check appium logs.');

      case 28:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[14, 22]]);
}

function testZipArchive(zipPath) {
  var execEnv, execOpts, output;
  return _regeneratorRuntime.async(function testZipArchive$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _logger2['default'].debug('Testing zip archive: ' + zipPath);

        if (!_appiumSupport.system.isWindows()) {
          context$1$0.next = 11;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(zipPath));

      case 4:
        if (!context$1$0.sent) {
          context$1$0.next = 9;
          break;
        }

        _logger2['default'].debug('Zip archive tested clean');
        return context$1$0.abrupt('return', true);

      case 9:
        _logger2['default'].debug('Zip archive not found');
        return context$1$0.abrupt('return', false);

      case 11:
        execEnv = _lodash2['default'].clone(process.env);

        delete execEnv.UNZIP;
        execOpts = { cwd: _path2['default'].dirname(zipPath), env: execEnv };
        output = undefined;
        context$1$0.prev = 15;
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('unzip', ['-tq', zipPath], execOpts));

      case 18:
        output = context$1$0.sent;

        if (!/No errors detected/.exec(output.stdout)) {
          context$1$0.next = 21;
          break;
        }

        return context$1$0.abrupt('return', true);

      case 21:
        _logger2['default'].error('Zip file ' + zipPath + ' was not valid');
        _logger2['default'].error('Stderr: ' + output.stderr);
        _logger2['default'].error('Stdout: ' + output.stdout);
        _logger2['default'].error('Zip archive did not test successfully, check appium server ' + 'logs for output');
        return context$1$0.abrupt('return', false);

      case 28:
        context$1$0.prev = 28;
        context$1$0.t0 = context$1$0['catch'](15);

        _logger2['default'].error('Test zip archive threw error ' + context$1$0.t0);
        _logger2['default'].error('Stderr: ' + context$1$0.t0.stderr);
        _logger2['default'].error('Stdout: ' + context$1$0.t0.stdout);
        throw new Error('Error testing zip archive, are you sure this is a zip file?');

      case 34:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[15, 28]]);
}

function copyFromWindowsNetworkShare(app, appExt, mountRoot, windowsUserName, windowsPassword) {
  return _regeneratorRuntime.async(function copyFromWindowsNetworkShare$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!_appiumSupport.system.isWindows()) {
          context$1$0.next = 6;
          break;
        }

        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(copyLocallyFromWindowsShare(app, appExt));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(mountWindowsShareOnMac(app, mountRoot, windowsUserName, windowsPassword));

      case 8:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 9:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function mountWindowsShareOnMac(app, mountRoot, windowsUserName, windowsPassword) {
  var pathSplit, networkShare, rootFolder, mountPath, mountNetworkShare, umountArgs;
  return _regeneratorRuntime.async(function mountWindowsShareOnMac$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        pathSplit = app.split("\\");
        networkShare = pathSplit[2];
        rootFolder = pathSplit[3];

        app = app.replace(/\\/g, "/");
        app = app.replace('/' + networkShare, mountRoot);
        mountPath = '/' + mountRoot + '/' + rootFolder;

        mountNetworkShare = function mountNetworkShare() {
          var mountArgs;
          return _regeneratorRuntime.async(function mountNetworkShare$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap(_appiumSupport.fs.mkdir(mountPath));

              case 2:
                mountArgs = ['-t', 'smbfs', '//' + windowsUserName + ':' + windowsPassword + '@' + networkShare + '/' + rootFolder, mountPath];
                context$2$0.prev = 3;
                context$2$0.next = 6;
                return _regeneratorRuntime.awrap((0, _teen_process.exec)('mount', mountArgs));

              case 6:
                context$2$0.next = 11;
                break;

              case 8:
                context$2$0.prev = 8;
                context$2$0.t0 = context$2$0['catch'](3);

                _logger2['default'].errorAndThrow('Error mounting: ' + context$2$0.t0.message);

              case 11:
              case 'end':
                return context$2$0.stop();
            }
          }, null, this, [[3, 8]]);
        };

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(mountPath));

      case 9:
        if (!context$1$0.sent) {
          context$1$0.next = 25;
          break;
        }

        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(app));

      case 12:
        if (!context$1$0.sent) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', app);

      case 14:
        umountArgs = [mountPath];
        context$1$0.prev = 15;
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)('umount', umountArgs));

      case 18:
        context$1$0.next = 23;
        break;

      case 20:
        context$1$0.prev = 20;
        context$1$0.t0 = context$1$0['catch'](15);

        _logger2['default'].error('Error Unmounting :' + context$1$0.t0.message);

      case 23:
        context$1$0.next = 25;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(mountRoot));

      case 25:
        context$1$0.next = 27;
        return _regeneratorRuntime.awrap(mountNetworkShare());

      case 27:
        return context$1$0.abrupt('return', app);

      case 28:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[15, 20]]);
}

function copyLocallyFromWindowsShare(app, appExt) {
  var fileInfo;
  return _regeneratorRuntime.async(function copyLocallyFromWindowsShare$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.open({ prefix: 'appium-app', suffix: appExt }));

      case 2:
        fileInfo = context$1$0.sent;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.copyFile(app, fileInfo.path));

      case 5:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function isPackageOrBundle(app) {
  return (/^([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)+$/.test(app)
  );
}

function getCoordDefault(val) {
  // going the long way and checking for undefined and null since
  // we can't be assured `elId` is a string and not an int. Same
  // thing with destElement below.
  return _appiumSupport.util.hasValue(val) ? val : 0.5;
}

function getSwipeTouchDuration(waitGesture) {
  // the touch action api uses ms, we want seconds
  // 0.8 is the default time for the operation
  var duration = 0.8;
  if (typeof waitGesture.options.ms !== 'undefined' && waitGesture.options.ms) {
    duration = waitGesture.options.ms / 1000;
    if (duration === 0) {
      // set to a very low number, since they wanted it fast
      // but below 0.1 becomes 0 steps, which causes errors
      duration = 0.1;
    }
  }
  return duration;
}

exports['default'] = { configureApp: configureApp, downloadApp: downloadApp, downloadFile: downloadFile, copyLocalZip: copyLocalZip,
  unzipApp: unzipApp, unzipFile: unzipFile, testZipArchive: testZipArchive, isPackageOrBundle: isPackageOrBundle,
  getCoordDefault: getCoordDefault, getSwipeTouchDuration: getSwipeTouchDuration, copyFromWindowsNetworkShare: copyFromWindowsNetworkShare };
module.exports = exports['default'];

// immediately shortcircuit if not given an app

// check if we're copying from a windows network share

// check if this is zipped

// We will be downloading the files to a directory, so make sure it's there
// This step is not required if you have manually created the directory

// don't use request-promise here, we need streams

// now delete any existing zip payload

// in the strict regex, we check for an entry which ends with the
// extension

// otherwise, we allow an entry which contains the extension, but we
// need to be careful, because it might be a false positive
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9iYXNlZHJpdmVyL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3NCQUFjLFFBQVE7Ozs7b0JBQ0wsTUFBTTs7OzttQkFDUCxLQUFLOzs7O3NCQUNGLFVBQVU7Ozs7bUJBQ2IsSUFBSTs7Ozt3QkFDTixVQUFVOzs7OzZCQUN1QixnQkFBZ0I7OzRCQUMxQyxjQUFjOzt1QkFDZixTQUFTOzs7O0FBRTdCLElBQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLElBQU0sYUFBYSxHQUFHLGlCQUFpQixDQUFDOztBQUV4QyxTQUFlLFlBQVksQ0FBRSxHQUFHLEVBQUUsTUFBTTtNQUFFLFNBQVMseURBQUMsU0FBUztNQUFFLG9CQUFvQix5REFBQyxFQUFFO01BQUUsb0JBQW9CLHlEQUFDLEVBQUU7O01BTXpHLE1BQU0sRUFDTixjQUFjLFFBVVgsVUFBVSxFQUFFLFdBQVcsRUFnQnRCLFdBQVc7Ozs7O1lBaENkLG9CQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUM7Ozs7Ozs7O0FBS2hCLGNBQU0sR0FBRyxHQUFHO0FBQ1osc0JBQWMsR0FBRyxLQUFLOzthQUd0QixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzs7Ozs7O3lDQUNWLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQ3ZELFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQzs7O0FBRHhELGNBQU07OztjQUlKLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7Ozs7QUFDckQsNEJBQU8sSUFBSSwrQkFBNEIsTUFBTSxRQUFJLENBQUM7O3lDQUNaLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDOzs7O0FBQTVELGtCQUFVLFFBQVYsVUFBVTtBQUFFLG1CQUFXLFFBQVgsV0FBVzs7QUFDNUIsY0FBTSxHQUFHLFVBQVUsQ0FBQzs7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QUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekMsUUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFOzs7QUFHbEIsY0FBUSxHQUFHLEdBQUcsQ0FBQztLQUNoQjtHQUNGO0FBQ0QsU0FBTyxRQUFRLENBQUM7Q0FDakI7O3FCQUVjLEVBQUUsWUFBWSxFQUFaLFlBQVksRUFBRSxXQUFXLEVBQVgsV0FBVyxFQUFFLFlBQVksRUFBWixZQUFZLEVBQUUsWUFBWSxFQUFaLFlBQVk7QUFDckQsVUFBUSxFQUFSLFFBQVEsRUFBRSxTQUFTLEVBQVQsU0FBUyxFQUFFLGNBQWMsRUFBZCxjQUFjLEVBQUUsaUJBQWlCLEVBQWpCLGlCQUFpQjtBQUN0RCxpQkFBZSxFQUFmLGVBQWUsRUFBRSxxQkFBcUIsRUFBckIscUJBQXFCLEVBQUUsMkJBQTJCLEVBQTNCLDJCQUEyQixFQUFFIiwiZmlsZSI6ImxpYi9iYXNlZHJpdmVyL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCBfZnMgZnJvbSAnZnMnO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHsgdGVtcERpciwgc3lzdGVtLCBmcywgdXRpbCwgemlwIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0JztcblxuY29uc3QgWklQX0VYVFMgPSBbJy56aXAnLCAnLmlwYSddO1xuY29uc3QgWklQX01JTUVfVFlQRSA9ICdhcHBsaWNhdGlvbi96aXAnO1xuXG5hc3luYyBmdW5jdGlvbiBjb25maWd1cmVBcHAgKGFwcCwgYXBwRXh0LCBtb3VudFJvb3Q9XCJWb2x1bWVzXCIsIHdpbmRvd3NTaGFyZVVzZXJOYW1lPVwiXCIsIHdpbmRvd3NTaGFyZVBhc3N3b3JkPVwiXCIpIHtcbiAgaWYgKCFfLmlzU3RyaW5nKGFwcCkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBzaG9ydGNpcmN1aXQgaWYgbm90IGdpdmVuIGFuIGFwcFxuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBuZXdBcHAgPSBhcHA7XG4gIGxldCBzaG91bGRVbnppcEFwcCA9IGZhbHNlO1xuXG4gIC8vIGNoZWNrIGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHdpbmRvd3MgbmV0d29yayBzaGFyZVxuICBpZiAobmV3QXBwLnN0YXJ0c1dpdGgoXCJcXFxcXCIpKSB7XG4gICAgbmV3QXBwID0gYXdhaXQgY29weUZyb21XaW5kb3dzTmV0d29ya1NoYXJlKG5ld0FwcCwgYXBwRXh0LFxuICAgICAgbW91bnRSb290LCB3aW5kb3dzU2hhcmVVc2VyTmFtZSwgd2luZG93c1NoYXJlUGFzc3dvcmQpO1xuICB9XG5cbiAgaWYgKG5ld0FwcC5zdGFydHNXaXRoKCdodHRwJykgJiYgbmV3QXBwLmluY2x1ZGVzKCc6Ly8nKSkge1xuICAgIGxvZ2dlci5pbmZvKGBVc2luZyBkb3dubG9hZGFibGUgYXBwICcke25ld0FwcH0nYCk7XG4gICAgbGV0IHt0YXJnZXRQYXRoLCBjb250ZW50VHlwZX0gPSBhd2FpdCBkb3dubG9hZEFwcChuZXdBcHAsIGFwcEV4dCk7XG4gICAgbmV3QXBwID0gdGFyZ2V0UGF0aDtcbiAgICAvLyB0aGUgZmlsZXR5cGUgbWF5IG5vdCBiZSBvYnZpb3VzIGZvciBjZXJ0YWluIHVybHMsIHNvIGNoZWNrIHRoZSBtaW1lIHR5cGUgdG9vXG4gICAgc2hvdWxkVW56aXBBcHAgPSBfLmluY2x1ZGVzKFpJUF9FWFRTLCBwYXRoLmV4dG5hbWUobmV3QXBwKSkgfHwgY29udGVudFR5cGUgPT09IFpJUF9NSU1FX1RZUEU7XG4gICAgbG9nZ2VyLmluZm8oYERvd25sb2FkZWQgYXBwIHRvICcke25ld0FwcH0nYCk7XG4gIH0gZWxzZSB7XG4gICAgbG9nZ2VyLmluZm8oYFVzaW5nIGxvY2FsIGFwcCAnJHtuZXdBcHB9J2ApO1xuICAgIGlmICghYXdhaXQgZnMuZXhpc3RzKG5ld0FwcCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGFwcGxpY2F0aW9uIGF0ICcke25ld0FwcH0nIGRvZXMgbm90IGV4aXN0IG9yIGlzIG5vdCBhY2Nlc3NpYmxlYCk7XG4gICAgfVxuICAgIHNob3VsZFVuemlwQXBwID0gXy5pbmNsdWRlcyhaSVBfRVhUUywgcGF0aC5leHRuYW1lKG5ld0FwcCkpO1xuICAgIG5ld0FwcCA9IHNob3VsZFVuemlwQXBwID8gYXdhaXQgY29weUxvY2FsWmlwKG5ld0FwcCkgOiBuZXdBcHA7XG4gIH1cblxuICBpZiAoc2hvdWxkVW56aXBBcHApIHtcbiAgICBsb2dnZXIuaW5mbyhgVW56aXBwaW5nIGxvY2FsIGFwcCAnJHtuZXdBcHB9Jy4uLmApO1xuICAgIGNvbnN0IGFyY2hpdmVQYXRoID0gbmV3QXBwO1xuICAgIHRyeSB7XG4gICAgICBuZXdBcHAgPSBhd2FpdCB1bnppcEFwcChhcmNoaXZlUGF0aCwgYXBwRXh0KTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgZnMucmltcmFmKGFyY2hpdmVQYXRoKTtcbiAgICB9XG4gICAgbG9nZ2VyLmluZm8oYFVuemlwcGVkIGxvY2FsIGFwcCB0byAnJHtuZXdBcHB9J2ApO1xuICB9XG5cbiAgaWYgKHBhdGguZXh0bmFtZShuZXdBcHApICE9PSBhcHBFeHQpIHtcbiAgICBpZiAobmV3QXBwICE9PSBhcHApIHtcbiAgICAgIGF3YWl0IGZzLnJpbXJhZihuZXdBcHApO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5ldyBhcHAgcGF0aCAke25ld0FwcH0gZGlkIG5vdCBoYXZlIGV4dGVuc2lvbiAke2FwcEV4dH1gKTtcbiAgfVxuXG4gIHJldHVybiBuZXdBcHA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQXBwIChhcHAsIGFwcEV4dCkge1xuICBsZXQgYXBwVXJsO1xuICB0cnkge1xuICAgIGFwcFVybCA9IHVybC5wYXJzZShhcHApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgQXBwIFVSTCAoJHthcHB9KWApO1xuICB9XG5cbiAgLy8gY2hlY2sgaWYgdGhpcyBpcyB6aXBwZWRcbiAgbGV0IGlzWmlwRmlsZSA9IF8uaW5jbHVkZXMoWklQX0VYVFMsIHBhdGguZXh0bmFtZShhcHBVcmwucGF0aG5hbWUpKTtcbiAgYXBwRXh0ID0gaXNaaXBGaWxlID8gJy56aXAnIDogYXBwRXh0O1xuXG4gIGxldCBkb3dubG9hZGVkQXBwO1xuICB0cnkge1xuICAgIGRvd25sb2FkZWRBcHAgPSBhd2FpdCBkb3dubG9hZEZpbGUodXJsLmZvcm1hdChhcHBVcmwpLCBhcHBFeHQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFByb2JsZW0gZG93bmxvYWRpbmcgYXBwIGZyb20gdXJsICR7YXBwfTogJHtlcnJ9YCk7XG4gIH1cblxuICByZXR1cm4gZG93bmxvYWRlZEFwcDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRGaWxlIChzb3VyY2VVcmwsIHN1ZmZpeCkge1xuICAvLyBXZSB3aWxsIGJlIGRvd25sb2FkaW5nIHRoZSBmaWxlcyB0byBhIGRpcmVjdG9yeSwgc28gbWFrZSBzdXJlIGl0J3MgdGhlcmVcbiAgLy8gVGhpcyBzdGVwIGlzIG5vdCByZXF1aXJlZCBpZiB5b3UgaGF2ZSBtYW51YWxseSBjcmVhdGVkIHRoZSBkaXJlY3RvcnlcbiAgbGV0IHRhcmdldFBhdGggPSBhd2FpdCB0ZW1wRGlyLnBhdGgoe3ByZWZpeDogJ2FwcGl1bS1hcHAnLCBzdWZmaXh9KTtcbiAgbGV0IGNvbnRlbnRUeXBlO1xuXG4gIC8vIGRvbid0IHVzZSByZXF1ZXN0LXByb21pc2UgaGVyZSwgd2UgbmVlZCBzdHJlYW1zXG4gIGF3YWl0IG5ldyBCKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXF1ZXN0KHNvdXJjZVVybClcbiAgICAgIC5vbignZXJyb3InLCByZWplY3QpIC8vIGhhbmRsZSByZWFsIGVycm9ycywgbGlrZSBjb25uZWN0aW9uIGVycm9yc1xuICAgICAgLm9uKCdyZXNwb25zZScsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgLy8gaGFuZGxlIHJlc3BvbnNlcyB0aGF0IGZhaWwsIGxpa2UgNDA0c1xuICAgICAgICBpZiAocmVzLnN0YXR1c0NvZGUgPj0gNDAwKSB7XG4gICAgICAgICAgcmVqZWN0KGBFcnJvciBkb3dubG9hZGluZyBmaWxlOiAke3Jlcy5zdGF0dXNDb2RlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRlbnRUeXBlID0gcmVzLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddO1xuICAgICAgfSlcbiAgICAgIC5waXBlKF9mcy5jcmVhdGVXcml0ZVN0cmVhbSh0YXJnZXRQYXRoKSlcbiAgICAgIC5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAub24oJ2Nsb3NlJywgcmVzb2x2ZSk7XG4gIH0pO1xuICBsb2dnZXIuZGVidWcoYCR7c291cmNlVXJsfSBkb3dubG9hZGVkIHRvICR7dGFyZ2V0UGF0aH1gKTtcbiAgbG9nZ2VyLmRlYnVnKGBEb3dubG9hZGVkIGZpbGUgdHlwZSAnJHtjb250ZW50VHlwZX0nYCk7XG4gIHJldHVybiB7dGFyZ2V0UGF0aCwgY29udGVudFR5cGV9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5TG9jYWxaaXAgKGxvY2FsWmlwUGF0aCkge1xuICBsb2dnZXIuZGVidWcoJ0NvcHlpbmcgbG9jYWwgemlwIHRvIHRtcCBkaXInKTtcbiAgaWYgKCEoYXdhaXQgZnMuZXhpc3RzKGxvY2FsWmlwUGF0aCkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdMb2NhbCB6aXAgZGlkIG5vdCBleGlzdCcpO1xuICB9XG4gIGxldCBmaWxlSW5mbyA9IGF3YWl0IHRlbXBEaXIub3Blbih7cHJlZml4OiAnYXBwaXVtLWFwcCcsIHN1ZmZpeDogJy56aXAnfSk7XG4gIGxldCBpbmZpbGUgPSBfZnMuY3JlYXRlUmVhZFN0cmVhbShsb2NhbFppcFBhdGgpO1xuICBsZXQgb3V0ZmlsZSA9IF9mcy5jcmVhdGVXcml0ZVN0cmVhbShmaWxlSW5mby5wYXRoKTtcbiAgcmV0dXJuIG5ldyBCKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpbmZpbGUucGlwZShvdXRmaWxlKS5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICByZXNvbHZlKGZpbGVJbmZvLnBhdGgpO1xuICAgIH0pLm9uKCdlcnJvcicsIChlcnIpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcm9taXNlL3ByZWZlci1hd2FpdC10by1jYWxsYmFja3NcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdW56aXBBcHAgKHppcFBhdGgsIGFwcEV4dCkge1xuICAvLyBmaXJzdCBkZWxldGUgYW55IGV4aXN0aW5nIGFwcHMgdGhhdCBtaWdodCBiZSBpbiBvdXIgdG1wIGRpclxuICBsZXQge3N0ZG91dH0gPSBhd2FpdCBleGVjKCdmaW5kJywgW3BhdGguZGlybmFtZSh6aXBQYXRoKSwgJy10eXBlJywgJ2QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICctbmFtZScsIGAqJHthcHBFeHR9YF0pO1xuICBmb3IgKGxldCBsaW5lIG9mIHN0ZG91dC50cmltKCkuc3BsaXQoJ1xcbicpLmZpbHRlcihCb29sZWFuKSkge1xuICAgIGF3YWl0IGZzLnJpbXJhZihsaW5lKTtcbiAgfVxuICAvLyBub3cgZGVsZXRlIGFueSBleGlzdGluZyB6aXAgcGF5bG9hZFxuICBhd2FpdCBmcy5yaW1yYWYocGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZSh6aXBQYXRoKSwgJ1BheWxvYWQqJykpO1xuICBsZXQgb3V0cHV0ID0gYXdhaXQgdW56aXBGaWxlKHppcFBhdGgpO1xuICBsZXQgcmVsYXhlZFJlZ1N0ciA9IGAoPzpjcmVhdGluZ3xpbmZsYXRpbmd8ZXh0cmFjdGluZyk6ICguKyR7YXBwRXh0fSkvP2A7XG4gIC8vIGluIHRoZSBzdHJpY3QgcmVnZXgsIHdlIGNoZWNrIGZvciBhbiBlbnRyeSB3aGljaCBlbmRzIHdpdGggdGhlXG4gIC8vIGV4dGVuc2lvblxuICBsZXQgc3RyaWN0UmVnID0gbmV3IFJlZ0V4cChgJHtyZWxheGVkUmVnU3RyfSRgLCAnbScpO1xuICAvLyBvdGhlcndpc2UsIHdlIGFsbG93IGFuIGVudHJ5IHdoaWNoIGNvbnRhaW5zIHRoZSBleHRlbnNpb24sIGJ1dCB3ZVxuICAvLyBuZWVkIHRvIGJlIGNhcmVmdWwsIGJlY2F1c2UgaXQgbWlnaHQgYmUgYSBmYWxzZSBwb3NpdGl2ZVxuICBsZXQgcmVsYXhlZFJlZyA9IG5ldyBSZWdFeHAocmVsYXhlZFJlZ1N0ciwgJ20nKTtcbiAgbGV0IHN0cmljdE1hdGNoID0gc3RyaWN0UmVnLmV4ZWMob3V0cHV0KTtcbiAgbGV0IHJlbGF4ZWRNYXRjaCA9IHJlbGF4ZWRSZWcuZXhlYyhvdXRwdXQpO1xuICBsZXQgZ2V0QXBwUGF0aCA9IGZ1bmN0aW9uIChtYXRjaCkge1xuICAgIHJldHVybiBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKHppcFBhdGgpLCBtYXRjaFsxXSk7XG4gIH07XG5cbiAgaWYgKHN0cmljdE1hdGNoKSB7XG4gICAgcmV0dXJuIGdldEFwcFBhdGgoc3RyaWN0TWF0Y2gpO1xuICB9XG5cbiAgaWYgKHJlbGF4ZWRNYXRjaCkge1xuICAgIGxvZ2dlci5kZWJ1ZygnR290IGEgcmVsYXhlZCBtYXRjaCBmb3IgYXBwIGluIHppcCwgYmUgY2FyZWZ1bCBmb3IgYXBwIG1hdGNoIGVycm9ycycpO1xuICAgIHJldHVybiBnZXRBcHBQYXRoKHJlbGF4ZWRNYXRjaCk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYEFwcCB6aXAgdW56aXBwZWQgT0ssIGJ1dCB3ZSBjb3VsZCBub3QgZmluZCBhICR7YXBwRXh0fSBidW5kbGUgYCArXG4gICAgICAgICAgICAgICAgICBgaW4gaXQuIE1ha2Ugc3VyZSB5b3VyIGFyY2hpdmUgY29udGFpbnMgdGhlICR7YXBwRXh0fSBwYWNrYWdlIGAgK1xuICAgICAgICAgICAgICAgICAgYGFuZCBub3RoaW5nIGVsc2VgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdW56aXBGaWxlICh6aXBQYXRoKSB7XG4gIGxvZ2dlci5kZWJ1ZyhgVW56aXBwaW5nICR7emlwUGF0aH1gKTtcbiAgbGV0IHZhbGlkID0gYXdhaXQgdGVzdFppcEFyY2hpdmUoemlwUGF0aCk7XG4gIGlmICghdmFsaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFppcCBhcmNoaXZlICR7emlwUGF0aH0gZGlkIG5vdCB0ZXN0IHZhbGlkYCk7XG4gIH1cblxuICBpZiAoc3lzdGVtLmlzV2luZG93cygpKSB7XG4gICAgYXdhaXQgemlwLmV4dHJhY3RBbGxUbyh6aXBQYXRoLCBwYXRoLmRpcm5hbWUoemlwUGF0aCkpO1xuICAgIGxvZ2dlci5kZWJ1ZygnVW56aXAgc3VjY2Vzc2Z1bCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBleGVjRW52ID0gXy5jbG9uZShwcm9jZXNzLmVudik7XG4gIGRlbGV0ZSBleGVjRW52LlVOWklQO1xuICBsZXQgZXhlY09wdHMgPSB7Y3dkOiBwYXRoLmRpcm5hbWUoemlwUGF0aCksIGVudjogZXhlY0Vudn07XG4gIHRyeSB7XG4gICAgbGV0IHtzdGRvdXR9ID0gYXdhaXQgZXhlYygndW56aXAnLCBbJy1vJywgemlwUGF0aF0sIGV4ZWNPcHRzKTtcbiAgICByZXR1cm4gc3Rkb3V0O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2dnZXIuZXJyb3IoYFVuemlwIHRocmV3IGVycm9yICR7ZXJyfWApO1xuICAgIGxvZ2dlci5lcnJvcihgU3RkZXJyOiAke2Vyci5zdGRlcnJ9YCk7XG4gICAgbG9nZ2VyLmVycm9yKGBTdGRvdXQ6ICR7ZXJyLnN0ZG91dH1gKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0FyY2hpdmUgY291bGQgbm90IGJlIHVuemlwcGVkLCBjaGVjayBhcHBpdW0gbG9ncy4nKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiB0ZXN0WmlwQXJjaGl2ZSAoemlwUGF0aCkge1xuICBsb2dnZXIuZGVidWcoYFRlc3RpbmcgemlwIGFyY2hpdmU6ICR7emlwUGF0aH1gKTtcbiAgaWYgKHN5c3RlbS5pc1dpbmRvd3MoKSkge1xuICAgIGlmIChhd2FpdCBmcy5leGlzdHMoemlwUGF0aCkpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnWmlwIGFyY2hpdmUgdGVzdGVkIGNsZWFuJyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdaaXAgYXJjaGl2ZSBub3QgZm91bmQnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBsZXQgZXhlY0VudiA9IF8uY2xvbmUocHJvY2Vzcy5lbnYpO1xuICBkZWxldGUgZXhlY0Vudi5VTlpJUDtcbiAgbGV0IGV4ZWNPcHRzID0ge2N3ZDogcGF0aC5kaXJuYW1lKHppcFBhdGgpLCBlbnY6IGV4ZWNFbnZ9O1xuICBsZXQgb3V0cHV0O1xuICB0cnkge1xuICAgIG91dHB1dCA9IGF3YWl0IGV4ZWMoJ3VuemlwJywgWyctdHEnLCB6aXBQYXRoXSwgZXhlY09wdHMpO1xuICAgIGlmICgvTm8gZXJyb3JzIGRldGVjdGVkLy5leGVjKG91dHB1dC5zdGRvdXQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbG9nZ2VyLmVycm9yKGBaaXAgZmlsZSAke3ppcFBhdGh9IHdhcyBub3QgdmFsaWRgKTtcbiAgICBsb2dnZXIuZXJyb3IoYFN0ZGVycjogJHtvdXRwdXQuc3RkZXJyfWApO1xuICAgIGxvZ2dlci5lcnJvcihgU3Rkb3V0OiAke291dHB1dC5zdGRvdXR9YCk7XG4gICAgbG9nZ2VyLmVycm9yKCdaaXAgYXJjaGl2ZSBkaWQgbm90IHRlc3Qgc3VjY2Vzc2Z1bGx5LCBjaGVjayBhcHBpdW0gc2VydmVyICcgK1xuICAgICAgICAgICAgICAgICAnbG9ncyBmb3Igb3V0cHV0Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2dnZXIuZXJyb3IoYFRlc3QgemlwIGFyY2hpdmUgdGhyZXcgZXJyb3IgJHtlcnJ9YCk7XG4gICAgbG9nZ2VyLmVycm9yKGBTdGRlcnI6ICR7ZXJyLnN0ZGVycn1gKTtcbiAgICBsb2dnZXIuZXJyb3IoYFN0ZG91dDogJHtlcnIuc3Rkb3V0fWApO1xuICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgdGVzdGluZyB6aXAgYXJjaGl2ZSwgYXJlIHlvdSBzdXJlIHRoaXMgaXMgYSB6aXAgZmlsZT8nKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5RnJvbVdpbmRvd3NOZXR3b3JrU2hhcmUgKGFwcCwgYXBwRXh0LCBtb3VudFJvb3QsIHdpbmRvd3NVc2VyTmFtZSwgd2luZG93c1Bhc3N3b3JkKSB7XG4gIGlmIChzeXN0ZW0uaXNXaW5kb3dzKCkpIHtcbiAgICByZXR1cm4gYXdhaXQgY29weUxvY2FsbHlGcm9tV2luZG93c1NoYXJlKGFwcCwgYXBwRXh0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYXdhaXQgbW91bnRXaW5kb3dzU2hhcmVPbk1hYyhhcHAsIG1vdW50Um9vdCwgd2luZG93c1VzZXJOYW1lLCB3aW5kb3dzUGFzc3dvcmQpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1vdW50V2luZG93c1NoYXJlT25NYWMgKGFwcCwgbW91bnRSb290LCB3aW5kb3dzVXNlck5hbWUsIHdpbmRvd3NQYXNzd29yZCkge1xuICBsZXQgcGF0aFNwbGl0ID0gYXBwLnNwbGl0KFwiXFxcXFwiKTtcbiAgbGV0IG5ldHdvcmtTaGFyZSA9IHBhdGhTcGxpdFsyXTtcbiAgbGV0IHJvb3RGb2xkZXIgPSBwYXRoU3BsaXRbM107XG4gIGFwcCA9IGFwcC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcbiAgYXBwID0gYXBwLnJlcGxhY2UoYC8ke25ldHdvcmtTaGFyZX1gLCBtb3VudFJvb3QpO1xuICBsZXQgbW91bnRQYXRoID0gYC8ke21vdW50Um9vdH0vJHtyb290Rm9sZGVyfWA7XG5cbiAgbGV0IG1vdW50TmV0d29ya1NoYXJlID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGF3YWl0IGZzLm1rZGlyKG1vdW50UGF0aCk7XG4gICAgbGV0IG1vdW50QXJncyA9IFtgLXRgLCBgc21iZnNgLCBgLy8ke3dpbmRvd3NVc2VyTmFtZX06JHt3aW5kb3dzUGFzc3dvcmR9QCR7bmV0d29ya1NoYXJlfS8ke3Jvb3RGb2xkZXJ9YCwgbW91bnRQYXRoXTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZXhlYygnbW91bnQnLCBtb3VudEFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yQW5kVGhyb3coYEVycm9yIG1vdW50aW5nOiAke2Vyci5tZXNzYWdlfWApO1xuICAgIH1cbiAgfTtcblxuICBpZiAoYXdhaXQgZnMuZXhpc3RzKG1vdW50UGF0aCkpIHtcbiAgICBpZiAoYXdhaXQgZnMuZXhpc3RzKGFwcCkpIHtcbiAgICAgIHJldHVybiBhcHA7XG4gICAgfVxuICAgIGxldCB1bW91bnRBcmdzID0gW21vdW50UGF0aF07XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGV4ZWMoJ3Vtb3VudCcsIHVtb3VudEFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBVbm1vdW50aW5nIDoke2Vyci5tZXNzYWdlfWApO1xuICAgIH1cbiAgICBhd2FpdCBmcy5yaW1yYWYobW91bnRSb290KTtcbiAgfVxuICBhd2FpdCBtb3VudE5ldHdvcmtTaGFyZSgpO1xuICByZXR1cm4gYXBwO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5TG9jYWxseUZyb21XaW5kb3dzU2hhcmUgKGFwcCwgYXBwRXh0KSB7XG4gIGxldCBmaWxlSW5mbyA9IGF3YWl0IHRlbXBEaXIub3Blbih7cHJlZml4OiAnYXBwaXVtLWFwcCcsIHN1ZmZpeDogYXBwRXh0fSk7XG4gIHJldHVybiBhd2FpdCBmcy5jb3B5RmlsZShhcHAsIGZpbGVJbmZvLnBhdGgpO1xufVxuXG5mdW5jdGlvbiBpc1BhY2thZ2VPckJ1bmRsZSAoYXBwKSB7XG4gIHJldHVybiAoL14oW2EtekEtWjAtOVxcLV9dK1xcLlthLXpBLVowLTlcXC1fXSspKyQvKS50ZXN0KGFwcCk7XG59XG5cbmZ1bmN0aW9uIGdldENvb3JkRGVmYXVsdCAodmFsKSB7XG4gIC8vIGdvaW5nIHRoZSBsb25nIHdheSBhbmQgY2hlY2tpbmcgZm9yIHVuZGVmaW5lZCBhbmQgbnVsbCBzaW5jZVxuICAvLyB3ZSBjYW4ndCBiZSBhc3N1cmVkIGBlbElkYCBpcyBhIHN0cmluZyBhbmQgbm90IGFuIGludC4gU2FtZVxuICAvLyB0aGluZyB3aXRoIGRlc3RFbGVtZW50IGJlbG93LlxuICByZXR1cm4gdXRpbC5oYXNWYWx1ZSh2YWwpID8gdmFsIDogMC41O1xufVxuXG5mdW5jdGlvbiBnZXRTd2lwZVRvdWNoRHVyYXRpb24gKHdhaXRHZXN0dXJlKSB7XG4gIC8vIHRoZSB0b3VjaCBhY3Rpb24gYXBpIHVzZXMgbXMsIHdlIHdhbnQgc2Vjb25kc1xuICAvLyAwLjggaXMgdGhlIGRlZmF1bHQgdGltZSBmb3IgdGhlIG9wZXJhdGlvblxuICBsZXQgZHVyYXRpb24gPSAwLjg7XG4gIGlmICh0eXBlb2Ygd2FpdEdlc3R1cmUub3B0aW9ucy5tcyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2FpdEdlc3R1cmUub3B0aW9ucy5tcykge1xuICAgIGR1cmF0aW9uID0gd2FpdEdlc3R1cmUub3B0aW9ucy5tcyAvIDEwMDA7XG4gICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICAvLyBzZXQgdG8gYSB2ZXJ5IGxvdyBudW1iZXIsIHNpbmNlIHRoZXkgd2FudGVkIGl0IGZhc3RcbiAgICAgIC8vIGJ1dCBiZWxvdyAwLjEgYmVjb21lcyAwIHN0ZXBzLCB3aGljaCBjYXVzZXMgZXJyb3JzXG4gICAgICBkdXJhdGlvbiA9IDAuMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGR1cmF0aW9uO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IGNvbmZpZ3VyZUFwcCwgZG93bmxvYWRBcHAsIGRvd25sb2FkRmlsZSwgY29weUxvY2FsWmlwLFxuICAgICAgICAgICAgICAgICB1bnppcEFwcCwgdW56aXBGaWxlLCB0ZXN0WmlwQXJjaGl2ZSwgaXNQYWNrYWdlT3JCdW5kbGUsXG4gICAgICAgICAgICAgICAgIGdldENvb3JkRGVmYXVsdCwgZ2V0U3dpcGVUb3VjaER1cmF0aW9uLCBjb3B5RnJvbVdpbmRvd3NOZXR3b3JrU2hhcmUgfTtcbiJdLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
