'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _teen_process = require('teen_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _loggerJs = require('../logger.js');

var _loggerJs2 = _interopRequireDefault(_loggerJs);

var _appiumSupport = require('appium-support');

var _helpersJs = require('../helpers.js');

var DEFAULT_PRIVATE_KEY = _path2['default'].resolve(_helpersJs.rootDir, 'keys', 'testkey.pk8');
var DEFAULT_CERTIFICATE = _path2['default'].resolve(_helpersJs.rootDir, 'keys', 'testkey.x509.pem');

var apkSigningMethods = {};

/**
 * Execute apksigner utility with given arguments. This method
 * also applies the patch, which workarounds
 * '-Djava.ext.dirs is not supported. Use -classpath instead.' error on Windows.
 *
 * @param {?Array<String>} args - The list of tool arguments.
 * @throws {Error} If apksigner binary is not present on the local file system
 *                 or the return code is not equal to zero.
 */
apkSigningMethods.executeApksigner = function callee$0$0() {
  var args = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var apkSigner, originalFolder, isPatched, originalContent, patchedContent;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap((0, _helpersJs.getApksignerForOs)(this));

      case 2:
        apkSigner = context$1$0.sent;
        originalFolder = _path2['default'].dirname(apkSigner);
        isPatched = false;
        context$1$0.t0 = _appiumSupport.system.isWindows();

        if (!context$1$0.t0) {
          context$1$0.next = 10;
          break;
        }

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(apkSigner));

      case 9:
        context$1$0.t0 = context$1$0.sent;

      case 10:
        if (!context$1$0.t0) {
          context$1$0.next = 25;
          break;
        }

        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.readFile(apkSigner, 'ascii'));

      case 13:
        originalContent = context$1$0.sent;
        patchedContent = originalContent.replace('-Djava.ext.dirs="%frameworkdir%"', '-cp "%frameworkdir%\\*"');

        if (!(patchedContent !== originalContent)) {
          context$1$0.next = 25;
          break;
        }

        _loggerJs2['default'].debug('Patching \'' + apkSigner + '\' for Windows...');
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.path({ prefix: 'apksigner', suffix: '.bat' }));

      case 19:
        apkSigner = context$1$0.sent;
        context$1$0.next = 22;
        return _regeneratorRuntime.awrap((0, _appiumSupport.mkdirp)(_path2['default'].dirname(apkSigner)));

      case 22:
        context$1$0.next = 24;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.writeFile(apkSigner, patchedContent, 'ascii'));

      case 24:
        isPatched = true;

      case 25:
        _loggerJs2['default'].debug('Starting ' + (isPatched ? 'patched ' : '') + '\'' + apkSigner + '\' with args \'' + args + '\'');
        context$1$0.prev = 26;
        context$1$0.next = 29;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)(apkSigner, args, { shell: true, cwd: originalFolder }));

      case 29:
        context$1$0.prev = 29;
        context$1$0.t1 = isPatched;

        if (!context$1$0.t1) {
          context$1$0.next = 35;
          break;
        }

        context$1$0.next = 34;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(apkSigner));

      case 34:
        context$1$0.t1 = context$1$0.sent;

      case 35:
        if (!context$1$0.t1) {
          context$1$0.next = 38;
          break;
        }

        context$1$0.next = 38;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.unlink(apkSigner));

      case 38:
        return context$1$0.finish(29);

      case 39:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[26,, 29, 39]]);
};

/**
 * (Re)sign the given apk file on the local file system with the default certificate.
 *
 * @param {string} apk - The full path to the local apk file.
 * @throws {Error} If signing fails.
 */
apkSigningMethods.signWithDefaultCert = function callee$0$0(apk) {
  var args, java, signPath;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _loggerJs2['default'].debug('Signing \'' + apk + '\' with default cert');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(apk));

      case 3:
        if (context$1$0.sent) {
          context$1$0.next = 5;
          break;
        }

        throw new Error(apk + ' file doesn\'t exist.');

      case 5:
        context$1$0.prev = 5;
        args = ['sign', '--key', DEFAULT_PRIVATE_KEY, '--cert', DEFAULT_CERTIFICATE, apk];
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(this.executeApksigner(args));

      case 9:
        context$1$0.next = 25;
        break;

      case 11:
        context$1$0.prev = 11;
        context$1$0.t0 = context$1$0['catch'](5);

        _loggerJs2['default'].warn('Cannot use apksigner tool for signing. Defaulting to sign.jar. ' + ('Original error: ' + context$1$0.t0.message));
        java = (0, _helpersJs.getJavaForOs)();
        signPath = _path2['default'].resolve(this.helperJarPath, 'sign.jar');

        _loggerJs2['default'].debug("Resigning apk.");
        context$1$0.prev = 17;
        context$1$0.next = 20;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)(java, ['-jar', signPath, apk, '--override']));

      case 20:
        context$1$0.next = 25;
        break;

      case 22:
        context$1$0.prev = 22;
        context$1$0.t1 = context$1$0['catch'](17);

        _loggerJs2['default'].errorAndThrow('Could not sign with default certificate. Original error ' + context$1$0.t1.message);

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[5, 11], [17, 22]]);
};

/**
 * (Re)sign the given apk file on the local file system with a custom certificate.
 *
 * @param {string} apk - The full path to the local apk file.
 * @throws {Error} If signing fails.
 */
apkSigningMethods.signWithCustomCert = function callee$0$0(apk) {
  var args, jarsigner;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _loggerJs2['default'].debug('Signing \'' + apk + '\' with custom cert');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(this.keystorePath));

      case 3:
        if (context$1$0.sent) {
          context$1$0.next = 5;
          break;
        }

        throw new Error('Keystore: ' + this.keystorePath + ' doesn\'t exist.');

      case 5:
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(apk));

      case 7:
        if (context$1$0.sent) {
          context$1$0.next = 9;
          break;
        }

        throw new Error('\'' + apk + '\' doesn\'t exist.');

      case 9:
        context$1$0.prev = 9;
        args = ['sign', '--ks', this.keystorePath, '--ks-key-alias', this.keyAlias, '--ks-pass', 'pass:' + this.keystorePassword, '--key-pass', 'pass:' + this.keyPassword, apk];
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(this.executeApksigner(args));

      case 13:
        context$1$0.next = 31;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](9);

        _loggerJs2['default'].warn('Cannot use apksigner tool for signing. Defaulting to jarsigner. ' + ('Original error: ' + context$1$0.t0.message));
        context$1$0.prev = 18;

        _loggerJs2['default'].debug("Unsigning apk.");
        context$1$0.next = 22;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)((0, _helpersJs.getJavaForOs)(), ['-jar', _path2['default'].resolve(this.helperJarPath, 'unsign.jar'), apk]));

      case 22:
        _loggerJs2['default'].debug("Signing apk.");
        jarsigner = _path2['default'].resolve((0, _helpersJs.getJavaHome)(), 'bin', 'jarsigner' + (_appiumSupport.system.isWindows() ? '.exe' : ''));
        context$1$0.next = 26;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)(jarsigner, ['-sigalg', 'MD5withRSA', '-digestalg', 'SHA1', '-keystore', this.keystorePath, '-storepass', this.keystorePassword, '-keypass', this.keyPassword, apk, this.keyAlias]));

      case 26:
        context$1$0.next = 31;
        break;

      case 28:
        context$1$0.prev = 28;
        context$1$0.t1 = context$1$0['catch'](18);

        _loggerJs2['default'].errorAndThrow('Could not sign with custom certificate. Original error ' + context$1$0.t1.message);

      case 31:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[9, 15], [18, 28]]);
};

/**
 * (Re)sign the given apk file on the local file system with either
 * custom or default certificate based on _this.useKeystore_ property value
 * and Zip-aligns it after signing.
 *
 * @param {string} apk - The full path to the local apk file.
 * @throws {Error} If signing fails.
 */
apkSigningMethods.sign = function callee$0$0(apk) {
  var apksignerFound;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        apksignerFound = true;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _helpersJs.getApksignerForOs)(this));

      case 4:
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(this.zipAlignApk(apk));

      case 6:
        context$1$0.next = 11;
        break;

      case 8:
        context$1$0.prev = 8;
        context$1$0.t0 = context$1$0['catch'](1);

        apksignerFound = false;

      case 11:
        if (!this.useKeystore) {
          context$1$0.next = 16;
          break;
        }

        context$1$0.next = 14;
        return _regeneratorRuntime.awrap(this.signWithCustomCert(apk));

      case 14:
        context$1$0.next = 18;
        break;

      case 16:
        context$1$0.next = 18;
        return _regeneratorRuntime.awrap(this.signWithDefaultCert(apk));

      case 18:
        if (apksignerFound) {
          context$1$0.next = 21;
          break;
        }

        context$1$0.next = 21;
        return _regeneratorRuntime.awrap(this.zipAlignApk(apk));

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 8]]);
};

/**
 * Perform zip-aligning to the given local apk file.
 *
 * @param {string} apk - The full path to the local apk file.
 * @throws {Error} If zip-align fails.
 */
apkSigningMethods.zipAlignApk = function callee$0$0(apk) {
  var alignedApk;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _loggerJs2['default'].debug('Zip-aligning \'' + apk + '\'');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(this.initZipAlign());

      case 3:
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(_appiumSupport.tempDir.path({ prefix: 'appium', suffix: '.tmp' }));

      case 5:
        alignedApk = context$1$0.sent;
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap((0, _appiumSupport.mkdirp)(_path2['default'].dirname(alignedApk)));

      case 8:
        context$1$0.prev = 8;
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)(this.binaries.zipalign, ['-f', '4', apk, alignedApk]));

      case 11:
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.mv(alignedApk, apk, { mkdirp: true }));

      case 13:
        context$1$0.next = 23;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](8);
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(alignedApk));

      case 19:
        if (!context$1$0.sent) {
          context$1$0.next = 22;
          break;
        }

        context$1$0.next = 22;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.unlink(alignedApk));

      case 22:
        _loggerJs2['default'].errorAndThrow('zipAlignApk failed. Original error: ' + context$1$0.t0.message + '. Stdout: \'' + context$1$0.t0.stdout + '\'; Stderr: \'' + context$1$0.t0.stderr + '\'');

      case 23:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[8, 15]]);
};

/**
 * Check if the app is already signed.
 *
 * @param {string} apk - The full path to the local apk file.
 * @param {string} pgk - The name of application package.
 * @return {boolean} True if given application is already signed.
 */
apkSigningMethods.checkApkCert = function callee$0$0(apk, pkg) {
  var verificationFunc;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _loggerJs2['default'].debug('Checking app cert for ' + apk);
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(apk));

      case 3:
        if (context$1$0.sent) {
          context$1$0.next = 6;
          break;
        }

        _loggerJs2['default'].debug('\'' + apk + '\' doesn\'t exist');
        return context$1$0.abrupt('return', false);

      case 6:
        if (!this.useKeystore) {
          context$1$0.next = 10;
          break;
        }

        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(this.checkCustomApkCert(apk, pkg));

      case 9:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 10:
        verificationFunc = undefined;
        context$1$0.prev = 11;
        context$1$0.next = 14;
        return _regeneratorRuntime.awrap((0, _helpersJs.getApksignerForOs)(this));

      case 14:
        verificationFunc = function callee$1$0() {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap(this.executeApksigner(['verify', apk]));

              case 2:
                return context$2$0.abrupt('return', context$2$0.sent);

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        };
        context$1$0.next = 20;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](11);

        (function () {
          _loggerJs2['default'].warn('Cannot use apksigner tool for signature verification. Defaulting to verify.jar. ' + ('Original error: ' + context$1$0.t0.message));
          var java = (0, _helpersJs.getJavaForOs)();
          verificationFunc = function callee$3$0() {
            return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
              while (1) switch (context$4$0.prev = context$4$0.next) {
                case 0:
                  context$4$0.next = 2;
                  return _regeneratorRuntime.awrap((0, _teen_process.exec)(java, ['-jar', _path2['default'].resolve(this.helperJarPath, 'verify.jar'), apk]));

                case 2:
                  return context$4$0.abrupt('return', context$4$0.sent);

                case 3:
                case 'end':
                  return context$4$0.stop();
              }
            }, null, _this);
          };
        })();

      case 20:
        context$1$0.prev = 20;
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(verificationFunc());

      case 23:
        _loggerJs2['default'].debug('\'' + apk + '\' is already signed.');
        return context$1$0.abrupt('return', true);

      case 27:
        context$1$0.prev = 27;
        context$1$0.t1 = context$1$0['catch'](20);

        _loggerJs2['default'].debug('\'' + apk + '\' is not signed with debug cert.');
        return context$1$0.abrupt('return', false);

      case 31:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[11, 17], [20, 27]]);
};

/**
 * Check if the app is already signed with a custom certificate.
 *
 * @param {string} apk - The full path to the local apk file.
 * @param {string} pgk - The name of application package.
 * @return {boolean} True if given application is already signed with a custom certificate.
 */
apkSigningMethods.checkCustomApkCert = function callee$0$0(apk, pkg) {
  var h, md5Str, md5, javaHome, keytool, keystoreHash;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _loggerJs2['default'].debug('Checking custom app cert for ' + apk);
        h = "a-fA-F0-9";
        md5Str = ['.*MD5.*((?:[' + h + ']{2}:){15}[' + h + ']{2})'];
        md5 = new RegExp(md5Str, 'mi');
        javaHome = (0, _helpersJs.getJavaHome)();
        keytool = _path2['default'].resolve(javaHome, 'bin', 'keytool' + (_appiumSupport.system.isWindows() ? '.exe' : ''));
        context$1$0.next = 8;
        return _regeneratorRuntime.awrap(this.getKeystoreMd5(keytool, md5));

      case 8:
        keystoreHash = context$1$0.sent;
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(this.checkApkKeystoreMatch(keytool, md5, keystoreHash, pkg, apk));

      case 11:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

/**
 * Get the MD5 hash of the keystore.
 *
 * @param {string} keytool - The name of the keytool utility.
 * @param {RegExp} md5re - The pattern used to match the result in _keytool_ output.
 * @return {?string} Keystore MD5 hash or _null_ if the hash cannot be parsed.
 * @throws {Error} If getting keystore MD5 hash fails.
 */
apkSigningMethods.getKeystoreMd5 = function callee$0$0(keytool, md5re) {
  var _ref, stdout, keystoreHash;

  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _loggerJs2['default'].debug("Printing keystore md5.");
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap((0, _teen_process.exec)(keytool, ['-v', '-list', '-alias', this.keyAlias, '-keystore', this.keystorePath, '-storepass', this.keystorePassword]));

      case 4:
        _ref = context$1$0.sent;
        stdout = _ref.stdout;
        keystoreHash = md5re.exec(stdout);

        keystoreHash = keystoreHash ? keystoreHash[1] : null;
        _loggerJs2['default'].debug('Keystore MD5: ' + keystoreHash);
        return context$1$0.abrupt('return', keystoreHash);

      case 12:
        context$1$0.prev = 12;
        context$1$0.t0 = context$1$0['catch'](1);

        _loggerJs2['default'].errorAndThrow('getKeystoreMd5 failed. Original error: ' + context$1$0.t0.message);

      case 15:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 12]]);
};

/**
 * Check if the MD5 hash of the particular application matches to the given hash.
 *
 * @param {string} keytool - The name of the keytool utility.
 * @param {RegExp} md5re - The pattern used to match the result in _keytool_ output.
 * @param {string} keystoreHash - The expected hash value.
 * @param {string} pkg - The name of the installed package.
 * @param {string} apk - The full path to the existing apk file.
 * @return {boolean} True if both hashes are equal.
 * @throws {Error} If getting keystore MD5 hash fails.
 */
apkSigningMethods.checkApkKeystoreMatch = function callee$0$0(keytool, md5re, keystoreHash, pkg, apk) {
  var entryHash, rsa, foundKeystoreMatch;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this2 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        entryHash = null;
        rsa = /^META-INF\/.*\.[rR][sS][aA]$/;
        foundKeystoreMatch = false;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(_appiumSupport.zip.readEntries(apk, function callee$1$0(_ref2) {
          var entry = _ref2.entry;
          var extractEntryTo = _ref2.extractEntryTo;

          var entryPath, entryFile, _ref3, stdout, matchesKeystore;

          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                entry = entry.fileName;

                if (rsa.test(entry)) {
                  context$2$0.next = 3;
                  break;
                }

                return context$2$0.abrupt('return');

              case 3:
                _loggerJs2['default'].debug('Entry: ' + entry);
                entryPath = _path2['default'].join(this.tmpDir, pkg, 'cert');

                _loggerJs2['default'].debug('entryPath: ' + entryPath);
                entryFile = _path2['default'].join(entryPath, entry);

                _loggerJs2['default'].debug('entryFile: ' + entryFile);
                // ensure /tmp/pkg/cert/ doesn't exist or extract will fail.
                context$2$0.next = 10;
                return _regeneratorRuntime.awrap(_appiumSupport.fs.rimraf(entryPath));

              case 10:
                context$2$0.next = 12;
                return _regeneratorRuntime.awrap(extractEntryTo(entryPath));

              case 12:
                _loggerJs2['default'].debug("extracted!");
                // check for match
                _loggerJs2['default'].debug("Printing apk md5.");
                context$2$0.next = 16;
                return _regeneratorRuntime.awrap((0, _teen_process.exec)(keytool, ['-v', '-printcert', '-file', entryFile]));

              case 16:
                _ref3 = context$2$0.sent;
                stdout = _ref3.stdout;

                entryHash = md5re.exec(stdout);
                entryHash = entryHash ? entryHash[1] : null;
                _loggerJs2['default'].debug('entryHash MD5: ' + entryHash);
                _loggerJs2['default'].debug('keystore MD5: ' + keystoreHash);
                matchesKeystore = entryHash && entryHash === keystoreHash;

                _loggerJs2['default'].debug('Matches keystore? ' + matchesKeystore);

                // If we have a keystore match, stop iterating

                if (!matchesKeystore) {
                  context$2$0.next = 27;
                  break;
                }

                foundKeystoreMatch = true;
                return context$2$0.abrupt('return', false);

              case 27:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this2);
        }));

      case 5:
        return context$1$0.abrupt('return', foundKeystoreMatch);

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

exports['default'] = apkSigningMethods;
module.exports = exports['default'];

// we only want to zipalign here if we are using apksigner
// otherwise do it at the end

//for (let entry of entries) {
// META-INF/CERT.RSA
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90b29scy9hcGstc2lnbmluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzRCQUFxQixjQUFjOztvQkFDbEIsTUFBTTs7Ozt3QkFDUCxjQUFjOzs7OzZCQUNtQixnQkFBZ0I7O3lCQUNLLGVBQWU7O0FBRXJGLElBQU0sbUJBQW1CLEdBQUcsa0JBQUssT0FBTyxxQkFBVSxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDekUsSUFBTSxtQkFBbUIsR0FBRyxrQkFBSyxPQUFPLHFCQUFVLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDOztBQUU5RSxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7QUFXM0IsaUJBQWlCLENBQUMsZ0JBQWdCLEdBQUc7TUFBZ0IsSUFBSSx5REFBRyxFQUFFO01BQ3hELFNBQVMsRUFDUCxjQUFjLEVBQ2hCLFNBQVMsRUFFTCxlQUFlLEVBQ2YsY0FBYzs7Ozs7eUNBTEEsa0NBQWtCLElBQUksQ0FBQzs7O0FBQXpDLGlCQUFTO0FBQ1Asc0JBQWMsR0FBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzFDLGlCQUFTLEdBQUcsS0FBSzt5QkFDakIsc0JBQU8sU0FBUyxFQUFFOzs7Ozs7Ozt5Q0FBVSxrQkFBRyxNQUFNLENBQUMsU0FBUyxDQUFDOzs7Ozs7Ozs7Ozs7eUNBQ3BCLGtCQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDOzs7QUFBdkQsdUJBQWU7QUFDZixzQkFBYyxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQy9FLHlCQUF5QixDQUFDOztjQUN4QixjQUFjLEtBQUssZUFBZSxDQUFBOzs7OztBQUNwQyw4QkFBSSxLQUFLLGlCQUFjLFNBQVMsdUJBQW1CLENBQUM7O3lDQUNsQyx1QkFBUSxJQUFJLENBQUMsRUFBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQzs7O0FBQXJFLGlCQUFTOzt5Q0FDSCwyQkFB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LEtBQUs7Ozs7Ozs7U0FFZixDQUFDOzs7NENBQ0ssa0JBQWtCOzs7Ozs7O0NBQzFCLENBQUM7O3FCQUVhLGlCQUFpQiIsImZpbGUiOiJsaWIvdG9vbHMvYXBrLXNpZ25pbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2dnZXIuanMnO1xuaW1wb3J0IHsgdGVtcERpciwgc3lzdGVtLCBta2RpcnAsIGZzLCB6aXAgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5pbXBvcnQgeyBnZXRKYXZhRm9yT3MsIGdldEFwa3NpZ25lckZvck9zLCBnZXRKYXZhSG9tZSwgcm9vdERpciB9IGZyb20gJy4uL2hlbHBlcnMuanMnO1xuXG5jb25zdCBERUZBVUxUX1BSSVZBVEVfS0VZID0gcGF0aC5yZXNvbHZlKHJvb3REaXIsICdrZXlzJywgJ3Rlc3RrZXkucGs4Jyk7XG5jb25zdCBERUZBVUxUX0NFUlRJRklDQVRFID0gcGF0aC5yZXNvbHZlKHJvb3REaXIsICdrZXlzJywgJ3Rlc3RrZXkueDUwOS5wZW0nKTtcblxubGV0IGFwa1NpZ25pbmdNZXRob2RzID0ge307XG5cbi8qKlxuICogRXhlY3V0ZSBhcGtzaWduZXIgdXRpbGl0eSB3aXRoIGdpdmVuIGFyZ3VtZW50cy4gVGhpcyBtZXRob2RcbiAqIGFsc28gYXBwbGllcyB0aGUgcGF0Y2gsIHdoaWNoIHdvcmthcm91bmRzXG4gKiAnLURqYXZhLmV4dC5kaXJzIGlzIG5vdCBzdXBwb3J0ZWQuIFVzZSAtY2xhc3NwYXRoIGluc3RlYWQuJyBlcnJvciBvbiBXaW5kb3dzLlxuICpcbiAqIEBwYXJhbSB7P0FycmF5PFN0cmluZz59IGFyZ3MgLSBUaGUgbGlzdCBvZiB0b29sIGFyZ3VtZW50cy5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBhcGtzaWduZXIgYmluYXJ5IGlzIG5vdCBwcmVzZW50IG9uIHRoZSBsb2NhbCBmaWxlIHN5c3RlbVxuICogICAgICAgICAgICAgICAgIG9yIHRoZSByZXR1cm4gY29kZSBpcyBub3QgZXF1YWwgdG8gemVyby5cbiAqL1xuYXBrU2lnbmluZ01ldGhvZHMuZXhlY3V0ZUFwa3NpZ25lciA9IGFzeW5jIGZ1bmN0aW9uIChhcmdzID0gW10pIHtcbiAgbGV0IGFwa1NpZ25lciA9IGF3YWl0IGdldEFwa3NpZ25lckZvck9zKHRoaXMpO1xuICBjb25zdCBvcmlnaW5hbEZvbGRlciA9IHBhdGguZGlybmFtZShhcGtTaWduZXIpO1xuICBsZXQgaXNQYXRjaGVkID0gZmFsc2U7XG4gIGlmIChzeXN0ZW0uaXNXaW5kb3dzKCkgJiYgYXdhaXQgZnMuZXhpc3RzKGFwa1NpZ25lcikpIHtcbiAgICBjb25zdCBvcmlnaW5hbENvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShhcGtTaWduZXIsICdhc2NpaScpO1xuICAgIGNvbnN0IHBhdGNoZWRDb250ZW50ID0gb3JpZ2luYWxDb250ZW50LnJlcGxhY2UoJy1EamF2YS5leHQuZGlycz1cIiVmcmFtZXdvcmtkaXIlXCInLFxuICAgICAgJy1jcCBcIiVmcmFtZXdvcmtkaXIlXFxcXCpcIicpO1xuICAgIGlmIChwYXRjaGVkQ29udGVudCAhPT0gb3JpZ2luYWxDb250ZW50KSB7XG4gICAgICBsb2cuZGVidWcoYFBhdGNoaW5nICcke2Fwa1NpZ25lcn0nIGZvciBXaW5kb3dzLi4uYCk7XG4gICAgICBhcGtTaWduZXIgPSBhd2FpdCB0ZW1wRGlyLnBhdGgoe3ByZWZpeDogJ2Fwa3NpZ25lcicsIHN1ZmZpeDogJy5iYXQnfSk7XG4gICAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGFwa1NpZ25lcikpO1xuICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGFwa1NpZ25lciwgcGF0Y2hlZENvbnRlbnQsICdhc2NpaScpO1xuICAgICAgaXNQYXRjaGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgbG9nLmRlYnVnKGBTdGFydGluZyAke2lzUGF0Y2hlZCA/ICdwYXRjaGVkICcgOiAnJ30nJHthcGtTaWduZXJ9JyB3aXRoIGFyZ3MgJyR7YXJnc30nYCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgZXhlYyhhcGtTaWduZXIsIGFyZ3MsIHtzaGVsbDogdHJ1ZSwgY3dkOiBvcmlnaW5hbEZvbGRlcn0pO1xuICB9IGZpbmFsbHkge1xuICAgIGlmIChpc1BhdGNoZWQgJiYgYXdhaXQgZnMuZXhpc3RzKGFwa1NpZ25lcikpIHtcbiAgICAgIGF3YWl0IGZzLnVubGluayhhcGtTaWduZXIpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiAoUmUpc2lnbiB0aGUgZ2l2ZW4gYXBrIGZpbGUgb24gdGhlIGxvY2FsIGZpbGUgc3lzdGVtIHdpdGggdGhlIGRlZmF1bHQgY2VydGlmaWNhdGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwayAtIFRoZSBmdWxsIHBhdGggdG8gdGhlIGxvY2FsIGFwayBmaWxlLlxuICogQHRocm93cyB7RXJyb3J9IElmIHNpZ25pbmcgZmFpbHMuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLnNpZ25XaXRoRGVmYXVsdENlcnQgPSBhc3luYyBmdW5jdGlvbiAoYXBrKSB7XG4gIGxvZy5kZWJ1ZyhgU2lnbmluZyAnJHthcGt9JyB3aXRoIGRlZmF1bHQgY2VydGApO1xuICBpZiAoIShhd2FpdCBmcy5leGlzdHMoYXBrKSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7YXBrfSBmaWxlIGRvZXNuJ3QgZXhpc3QuYCk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ3NpZ24nLFxuICAgICAgJy0ta2V5JywgREVGQVVMVF9QUklWQVRFX0tFWSxcbiAgICAgICctLWNlcnQnLCBERUZBVUxUX0NFUlRJRklDQVRFLFxuICAgICAgYXBrXTtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVBcGtzaWduZXIoYXJncyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy53YXJuKGBDYW5ub3QgdXNlIGFwa3NpZ25lciB0b29sIGZvciBzaWduaW5nLiBEZWZhdWx0aW5nIHRvIHNpZ24uamFyLiBgICtcbiAgICAgICAgICAgICBgT3JpZ2luYWwgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgY29uc3QgamF2YSA9IGdldEphdmFGb3JPcygpO1xuICAgIGNvbnN0IHNpZ25QYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuaGVscGVySmFyUGF0aCwgJ3NpZ24uamFyJyk7XG4gICAgbG9nLmRlYnVnKFwiUmVzaWduaW5nIGFway5cIik7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGV4ZWMoamF2YSwgWyctamFyJywgc2lnblBhdGgsIGFwaywgJy0tb3ZlcnJpZGUnXSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nLmVycm9yQW5kVGhyb3coYENvdWxkIG5vdCBzaWduIHdpdGggZGVmYXVsdCBjZXJ0aWZpY2F0ZS4gT3JpZ2luYWwgZXJyb3IgJHtlLm1lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIChSZSlzaWduIHRoZSBnaXZlbiBhcGsgZmlsZSBvbiB0aGUgbG9jYWwgZmlsZSBzeXN0ZW0gd2l0aCBhIGN1c3RvbSBjZXJ0aWZpY2F0ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBrIC0gVGhlIGZ1bGwgcGF0aCB0byB0aGUgbG9jYWwgYXBrIGZpbGUuXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgc2lnbmluZyBmYWlscy5cbiAqL1xuYXBrU2lnbmluZ01ldGhvZHMuc2lnbldpdGhDdXN0b21DZXJ0ID0gYXN5bmMgZnVuY3Rpb24gKGFwaykge1xuICBsb2cuZGVidWcoYFNpZ25pbmcgJyR7YXBrfScgd2l0aCBjdXN0b20gY2VydGApO1xuICBpZiAoIShhd2FpdCBmcy5leGlzdHModGhpcy5rZXlzdG9yZVBhdGgpKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgS2V5c3RvcmU6ICR7dGhpcy5rZXlzdG9yZVBhdGh9IGRvZXNuJ3QgZXhpc3QuYCk7XG4gIH1cbiAgaWYgKCEoYXdhaXQgZnMuZXhpc3RzKGFwaykpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAnJHthcGt9JyBkb2Vzbid0IGV4aXN0LmApO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBhcmdzID0gWydzaWduJyxcbiAgICAgICctLWtzJywgdGhpcy5rZXlzdG9yZVBhdGgsXG4gICAgICAnLS1rcy1rZXktYWxpYXMnLCB0aGlzLmtleUFsaWFzLFxuICAgICAgJy0ta3MtcGFzcycsIGBwYXNzOiR7dGhpcy5rZXlzdG9yZVBhc3N3b3JkfWAsXG4gICAgICAnLS1rZXktcGFzcycsIGBwYXNzOiR7dGhpcy5rZXlQYXNzd29yZH1gLFxuICAgICAgYXBrXTtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVBcGtzaWduZXIoYXJncyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy53YXJuKGBDYW5ub3QgdXNlIGFwa3NpZ25lciB0b29sIGZvciBzaWduaW5nLiBEZWZhdWx0aW5nIHRvIGphcnNpZ25lci4gYCArXG4gICAgICAgICAgICAgYE9yaWdpbmFsIGVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xuICAgIHRyeSB7XG4gICAgICBsb2cuZGVidWcoXCJVbnNpZ25pbmcgYXBrLlwiKTtcbiAgICAgIGF3YWl0IGV4ZWMoZ2V0SmF2YUZvck9zKCksIFsnLWphcicsIHBhdGgucmVzb2x2ZSh0aGlzLmhlbHBlckphclBhdGgsICd1bnNpZ24uamFyJyksIGFwa10pO1xuICAgICAgbG9nLmRlYnVnKFwiU2lnbmluZyBhcGsuXCIpO1xuICAgICAgY29uc3QgamFyc2lnbmVyID0gcGF0aC5yZXNvbHZlKGdldEphdmFIb21lKCksICdiaW4nLCBgamFyc2lnbmVyJHtzeXN0ZW0uaXNXaW5kb3dzKCkgPyAnLmV4ZScgOiAnJ31gKTtcbiAgICAgIGF3YWl0IGV4ZWMoamFyc2lnbmVyLCBbJy1zaWdhbGcnLCAnTUQ1d2l0aFJTQScsICctZGlnZXN0YWxnJywgJ1NIQTEnLFxuICAgICAgICAnLWtleXN0b3JlJywgdGhpcy5rZXlzdG9yZVBhdGgsICctc3RvcmVwYXNzJywgdGhpcy5rZXlzdG9yZVBhc3N3b3JkLFxuICAgICAgICAnLWtleXBhc3MnLCB0aGlzLmtleVBhc3N3b3JkLCBhcGssIHRoaXMua2V5QWxpYXNdKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2cuZXJyb3JBbmRUaHJvdyhgQ291bGQgbm90IHNpZ24gd2l0aCBjdXN0b20gY2VydGlmaWNhdGUuIE9yaWdpbmFsIGVycm9yICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiAoUmUpc2lnbiB0aGUgZ2l2ZW4gYXBrIGZpbGUgb24gdGhlIGxvY2FsIGZpbGUgc3lzdGVtIHdpdGggZWl0aGVyXG4gKiBjdXN0b20gb3IgZGVmYXVsdCBjZXJ0aWZpY2F0ZSBiYXNlZCBvbiBfdGhpcy51c2VLZXlzdG9yZV8gcHJvcGVydHkgdmFsdWVcbiAqIGFuZCBaaXAtYWxpZ25zIGl0IGFmdGVyIHNpZ25pbmcuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwayAtIFRoZSBmdWxsIHBhdGggdG8gdGhlIGxvY2FsIGFwayBmaWxlLlxuICogQHRocm93cyB7RXJyb3J9IElmIHNpZ25pbmcgZmFpbHMuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLnNpZ24gPSBhc3luYyBmdW5jdGlvbiAoYXBrKSB7XG4gIGxldCBhcGtzaWduZXJGb3VuZCA9IHRydWU7XG4gIHRyeSB7XG4gICAgYXdhaXQgZ2V0QXBrc2lnbmVyRm9yT3ModGhpcyk7XG4gICAgLy8gd2Ugb25seSB3YW50IHRvIHppcGFsaWduIGhlcmUgaWYgd2UgYXJlIHVzaW5nIGFwa3NpZ25lclxuICAgIC8vIG90aGVyd2lzZSBkbyBpdCBhdCB0aGUgZW5kXG4gICAgYXdhaXQgdGhpcy56aXBBbGlnbkFwayhhcGspO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBhcGtzaWduZXJGb3VuZCA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMudXNlS2V5c3RvcmUpIHtcbiAgICBhd2FpdCB0aGlzLnNpZ25XaXRoQ3VzdG9tQ2VydChhcGspO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IHRoaXMuc2lnbldpdGhEZWZhdWx0Q2VydChhcGspO1xuICB9XG5cbiAgaWYgKCFhcGtzaWduZXJGb3VuZCkge1xuICAgIGF3YWl0IHRoaXMuemlwQWxpZ25BcGsoYXBrKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQZXJmb3JtIHppcC1hbGlnbmluZyB0byB0aGUgZ2l2ZW4gbG9jYWwgYXBrIGZpbGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwayAtIFRoZSBmdWxsIHBhdGggdG8gdGhlIGxvY2FsIGFwayBmaWxlLlxuICogQHRocm93cyB7RXJyb3J9IElmIHppcC1hbGlnbiBmYWlscy5cbiAqL1xuYXBrU2lnbmluZ01ldGhvZHMuemlwQWxpZ25BcGsgPSBhc3luYyBmdW5jdGlvbiAoYXBrKSB7XG4gIGxvZy5kZWJ1ZyhgWmlwLWFsaWduaW5nICcke2Fwa30nYCk7XG4gIGF3YWl0IHRoaXMuaW5pdFppcEFsaWduKCk7XG4gIGxldCBhbGlnbmVkQXBrID0gYXdhaXQgdGVtcERpci5wYXRoKHtwcmVmaXg6ICdhcHBpdW0nLCBzdWZmaXg6ICcudG1wJ30pO1xuICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGFsaWduZWRBcGspKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjKHRoaXMuYmluYXJpZXMuemlwYWxpZ24sIFsnLWYnLCAnNCcsIGFwaywgYWxpZ25lZEFwa10pO1xuICAgIGF3YWl0IGZzLm12KGFsaWduZWRBcGssIGFwaywgeyBta2RpcnA6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoYXdhaXQgZnMuZXhpc3RzKGFsaWduZWRBcGspKSB7XG4gICAgICBhd2FpdCBmcy51bmxpbmsoYWxpZ25lZEFwayk7XG4gICAgfVxuICAgIGxvZy5lcnJvckFuZFRocm93KGB6aXBBbGlnbkFwayBmYWlsZWQuIE9yaWdpbmFsIGVycm9yOiAke2UubWVzc2FnZX0uIFN0ZG91dDogJyR7ZS5zdGRvdXR9JzsgU3RkZXJyOiAnJHtlLnN0ZGVycn0nYCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGFwcCBpcyBhbHJlYWR5IHNpZ25lZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBrIC0gVGhlIGZ1bGwgcGF0aCB0byB0aGUgbG9jYWwgYXBrIGZpbGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGdrIC0gVGhlIG5hbWUgb2YgYXBwbGljYXRpb24gcGFja2FnZS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgZ2l2ZW4gYXBwbGljYXRpb24gaXMgYWxyZWFkeSBzaWduZWQuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLmNoZWNrQXBrQ2VydCA9IGFzeW5jIGZ1bmN0aW9uIChhcGssIHBrZykge1xuICBsb2cuZGVidWcoYENoZWNraW5nIGFwcCBjZXJ0IGZvciAke2Fwa31gKTtcbiAgaWYgKCFhd2FpdCBmcy5leGlzdHMoYXBrKSkge1xuICAgIGxvZy5kZWJ1ZyhgJyR7YXBrfScgZG9lc24ndCBleGlzdGApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodGhpcy51c2VLZXlzdG9yZSkge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNoZWNrQ3VzdG9tQXBrQ2VydChhcGssIHBrZyk7XG4gIH1cblxuICBsZXQgdmVyaWZpY2F0aW9uRnVuYztcbiAgdHJ5IHtcbiAgICBhd2FpdCBnZXRBcGtzaWduZXJGb3JPcyh0aGlzKTtcbiAgICB2ZXJpZmljYXRpb25GdW5jID0gYXN5bmMgKCkgPT4gYXdhaXQgdGhpcy5leGVjdXRlQXBrc2lnbmVyKFsndmVyaWZ5JywgYXBrXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2cud2FybihgQ2Fubm90IHVzZSBhcGtzaWduZXIgdG9vbCBmb3Igc2lnbmF0dXJlIHZlcmlmaWNhdGlvbi4gRGVmYXVsdGluZyB0byB2ZXJpZnkuamFyLiBgICtcbiAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgY29uc3QgamF2YSA9IGdldEphdmFGb3JPcygpO1xuICAgIHZlcmlmaWNhdGlvbkZ1bmMgPSBhc3luYyAoKSA9PiBhd2FpdCBleGVjKGphdmEsIFsnLWphcicsIHBhdGgucmVzb2x2ZSh0aGlzLmhlbHBlckphclBhdGgsICd2ZXJpZnkuamFyJyksIGFwa10pO1xuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgdmVyaWZpY2F0aW9uRnVuYygpO1xuICAgIGxvZy5kZWJ1ZyhgJyR7YXBrfScgaXMgYWxyZWFkeSBzaWduZWQuYCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2cuZGVidWcoYCcke2Fwa30nIGlzIG5vdCBzaWduZWQgd2l0aCBkZWJ1ZyBjZXJ0LmApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgYXBwIGlzIGFscmVhZHkgc2lnbmVkIHdpdGggYSBjdXN0b20gY2VydGlmaWNhdGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwayAtIFRoZSBmdWxsIHBhdGggdG8gdGhlIGxvY2FsIGFwayBmaWxlLlxuICogQHBhcmFtIHtzdHJpbmd9IHBnayAtIFRoZSBuYW1lIG9mIGFwcGxpY2F0aW9uIHBhY2thZ2UuXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGdpdmVuIGFwcGxpY2F0aW9uIGlzIGFscmVhZHkgc2lnbmVkIHdpdGggYSBjdXN0b20gY2VydGlmaWNhdGUuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLmNoZWNrQ3VzdG9tQXBrQ2VydCA9IGFzeW5jIGZ1bmN0aW9uIChhcGssIHBrZykge1xuICBsb2cuZGVidWcoYENoZWNraW5nIGN1c3RvbSBhcHAgY2VydCBmb3IgJHthcGt9YCk7XG4gIGxldCBoID0gXCJhLWZBLUYwLTlcIjtcbiAgbGV0IG1kNVN0ciA9IFtgLipNRDUuKigoPzpbJHtofV17Mn06KXsxNX1bJHtofV17Mn0pYF07XG4gIGxldCBtZDUgPSBuZXcgUmVnRXhwKG1kNVN0ciwgJ21pJyk7XG4gIGxldCBqYXZhSG9tZSA9IGdldEphdmFIb21lKCk7XG4gIGxldCBrZXl0b29sID0gcGF0aC5yZXNvbHZlKGphdmFIb21lLCAnYmluJywgYGtleXRvb2wke3N5c3RlbS5pc1dpbmRvd3MoKSA/ICcuZXhlJyA6ICcnfWApO1xuICBsZXQga2V5c3RvcmVIYXNoID0gYXdhaXQgdGhpcy5nZXRLZXlzdG9yZU1kNShrZXl0b29sLCBtZDUpO1xuICByZXR1cm4gYXdhaXQgdGhpcy5jaGVja0Fwa0tleXN0b3JlTWF0Y2goa2V5dG9vbCwgbWQ1LCBrZXlzdG9yZUhhc2gsIHBrZywgYXBrKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBNRDUgaGFzaCBvZiB0aGUga2V5c3RvcmUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleXRvb2wgLSBUaGUgbmFtZSBvZiB0aGUga2V5dG9vbCB1dGlsaXR5LlxuICogQHBhcmFtIHtSZWdFeHB9IG1kNXJlIC0gVGhlIHBhdHRlcm4gdXNlZCB0byBtYXRjaCB0aGUgcmVzdWx0IGluIF9rZXl0b29sXyBvdXRwdXQuXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBLZXlzdG9yZSBNRDUgaGFzaCBvciBfbnVsbF8gaWYgdGhlIGhhc2ggY2Fubm90IGJlIHBhcnNlZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBnZXR0aW5nIGtleXN0b3JlIE1ENSBoYXNoIGZhaWxzLlxuICovXG5hcGtTaWduaW5nTWV0aG9kcy5nZXRLZXlzdG9yZU1kNSA9IGFzeW5jIGZ1bmN0aW9uIChrZXl0b29sLCBtZDVyZSkge1xuICBsb2cuZGVidWcoXCJQcmludGluZyBrZXlzdG9yZSBtZDUuXCIpO1xuICB0cnkge1xuICAgIGxldCB7c3Rkb3V0fSA9IGF3YWl0IGV4ZWMoa2V5dG9vbCwgWyctdicsICctbGlzdCcsXG4gICAgICAnLWFsaWFzJywgdGhpcy5rZXlBbGlhcyxcbiAgICAgICcta2V5c3RvcmUnLCB0aGlzLmtleXN0b3JlUGF0aCxcbiAgICAgICctc3RvcmVwYXNzJywgdGhpcy5rZXlzdG9yZVBhc3N3b3JkXSk7XG4gICAgbGV0IGtleXN0b3JlSGFzaCA9IG1kNXJlLmV4ZWMoc3Rkb3V0KTtcbiAgICBrZXlzdG9yZUhhc2ggPSBrZXlzdG9yZUhhc2ggPyBrZXlzdG9yZUhhc2hbMV0gOiBudWxsO1xuICAgIGxvZy5kZWJ1ZyhgS2V5c3RvcmUgTUQ1OiAke2tleXN0b3JlSGFzaH1gKTtcbiAgICByZXR1cm4ga2V5c3RvcmVIYXNoO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nLmVycm9yQW5kVGhyb3coYGdldEtleXN0b3JlTWQ1IGZhaWxlZC4gT3JpZ2luYWwgZXJyb3I6ICR7ZS5tZXNzYWdlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBNRDUgaGFzaCBvZiB0aGUgcGFydGljdWxhciBhcHBsaWNhdGlvbiBtYXRjaGVzIHRvIHRoZSBnaXZlbiBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXl0b29sIC0gVGhlIG5hbWUgb2YgdGhlIGtleXRvb2wgdXRpbGl0eS5cbiAqIEBwYXJhbSB7UmVnRXhwfSBtZDVyZSAtIFRoZSBwYXR0ZXJuIHVzZWQgdG8gbWF0Y2ggdGhlIHJlc3VsdCBpbiBfa2V5dG9vbF8gb3V0cHV0LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleXN0b3JlSGFzaCAtIFRoZSBleHBlY3RlZCBoYXNoIHZhbHVlLlxuICogQHBhcmFtIHtzdHJpbmd9IHBrZyAtIFRoZSBuYW1lIG9mIHRoZSBpbnN0YWxsZWQgcGFja2FnZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhcGsgLSBUaGUgZnVsbCBwYXRoIHRvIHRoZSBleGlzdGluZyBhcGsgZmlsZS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgYm90aCBoYXNoZXMgYXJlIGVxdWFsLlxuICogQHRocm93cyB7RXJyb3J9IElmIGdldHRpbmcga2V5c3RvcmUgTUQ1IGhhc2ggZmFpbHMuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLmNoZWNrQXBrS2V5c3RvcmVNYXRjaCA9IGFzeW5jIGZ1bmN0aW9uIChrZXl0b29sLCBtZDVyZSwga2V5c3RvcmVIYXNoLFxuICAgIHBrZywgYXBrKSB7XG4gIGxldCBlbnRyeUhhc2ggPSBudWxsO1xuICBsZXQgcnNhID0gL15NRVRBLUlORlxcLy4qXFwuW3JSXVtzU11bYUFdJC87XG4gIGxldCBmb3VuZEtleXN0b3JlTWF0Y2ggPSBmYWxzZTtcblxuICAvL2ZvciAobGV0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgYXdhaXQgemlwLnJlYWRFbnRyaWVzKGFwaywgYXN5bmMgKHtlbnRyeSwgZXh0cmFjdEVudHJ5VG99KSA9PiB7XG4gICAgZW50cnkgPSBlbnRyeS5maWxlTmFtZTtcbiAgICBpZiAoIXJzYS50ZXN0KGVudHJ5KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2cuZGVidWcoYEVudHJ5OiAke2VudHJ5fWApO1xuICAgIGxldCBlbnRyeVBhdGggPSBwYXRoLmpvaW4odGhpcy50bXBEaXIsIHBrZywgJ2NlcnQnKTtcbiAgICBsb2cuZGVidWcoYGVudHJ5UGF0aDogJHtlbnRyeVBhdGh9YCk7XG4gICAgbGV0IGVudHJ5RmlsZSA9IHBhdGguam9pbihlbnRyeVBhdGgsIGVudHJ5KTtcbiAgICBsb2cuZGVidWcoYGVudHJ5RmlsZTogJHtlbnRyeUZpbGV9YCk7XG4gICAgLy8gZW5zdXJlIC90bXAvcGtnL2NlcnQvIGRvZXNuJ3QgZXhpc3Qgb3IgZXh0cmFjdCB3aWxsIGZhaWwuXG4gICAgYXdhaXQgZnMucmltcmFmKGVudHJ5UGF0aCk7XG4gICAgLy8gTUVUQS1JTkYvQ0VSVC5SU0FcbiAgICBhd2FpdCBleHRyYWN0RW50cnlUbyhlbnRyeVBhdGgpO1xuICAgIGxvZy5kZWJ1ZyhcImV4dHJhY3RlZCFcIik7XG4gICAgLy8gY2hlY2sgZm9yIG1hdGNoXG4gICAgbG9nLmRlYnVnKFwiUHJpbnRpbmcgYXBrIG1kNS5cIik7XG4gICAgbGV0IHtzdGRvdXR9ID0gYXdhaXQgZXhlYyhrZXl0b29sLCBbJy12JywgJy1wcmludGNlcnQnLCAnLWZpbGUnLCBlbnRyeUZpbGVdKTtcbiAgICBlbnRyeUhhc2ggPSBtZDVyZS5leGVjKHN0ZG91dCk7XG4gICAgZW50cnlIYXNoID0gZW50cnlIYXNoID8gZW50cnlIYXNoWzFdIDogbnVsbDtcbiAgICBsb2cuZGVidWcoYGVudHJ5SGFzaCBNRDU6ICR7ZW50cnlIYXNofWApO1xuICAgIGxvZy5kZWJ1Zyhga2V5c3RvcmUgTUQ1OiAke2tleXN0b3JlSGFzaH1gKTtcbiAgICBsZXQgbWF0Y2hlc0tleXN0b3JlID0gZW50cnlIYXNoICYmIGVudHJ5SGFzaCA9PT0ga2V5c3RvcmVIYXNoO1xuICAgIGxvZy5kZWJ1ZyhgTWF0Y2hlcyBrZXlzdG9yZT8gJHttYXRjaGVzS2V5c3RvcmV9YCk7XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGEga2V5c3RvcmUgbWF0Y2gsIHN0b3AgaXRlcmF0aW5nXG4gICAgaWYgKG1hdGNoZXNLZXlzdG9yZSkge1xuICAgICAgZm91bmRLZXlzdG9yZU1hdGNoID0gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZm91bmRLZXlzdG9yZU1hdGNoO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXBrU2lnbmluZ01ldGhvZHM7XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
