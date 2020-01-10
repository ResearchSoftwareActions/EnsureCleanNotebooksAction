module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(470);
const walk = __webpack_require__(191);
const path = __webpack_require__(622);
const lint = __webpack_require__(877);

const disableChecks = core.getInput('disable-checks', {required: false});

let disabled = [];
if (disableChecks) {
    disabled = disableChecks.split(',');
}

const walker = walk.walk(".", {followLinks: false, filters: ["node_modules"]});
const results = [];
walker.on("file", function (root, fileStats, next) {
    if (path.extname(fileStats.name) === '.ipynb') {
        results.push(lint(path.join(root, fileStats.name), disabled));
    }
    next();
});

walker.on("end", function () {
    if (!results.every(i => i)) {
        console.log(`${results.filter(v => !v).length}/${results.length} notebooks need cleaning!`);
        core.setFailed('Lint failed');
    } else {
        console.log(`${results.length}/${results.length} notebooks are clean!`);
    }
});


/***/ }),

/***/ 191:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

// Adapted from work by jorge@jorgechamorro.com on 2010-11-25
(function () {
  "use strict";

  function noop() {}

  var fs = __webpack_require__(747)
    , forEachAsync = __webpack_require__(724).forEachAsync
    , EventEmitter = __webpack_require__(614).EventEmitter
    , TypeEmitter = __webpack_require__(381)
    , util = __webpack_require__(669)
    , path = __webpack_require__(622)
    ;

  function appendToDirs(stat) {
    /*jshint validthis:true*/
    if(stat.flag && stat.flag === NO_DESCEND) { return; }
    this.push(stat.name);
  }

  function wFilesHandlerWrapper(items) {
    /*jshint validthis:true*/
    this._wFilesHandler(noop, items);
  }

  function Walker(pathname, options, sync) {
    EventEmitter.call(this);

    var me = this
      ;

    options = options || {};
    me._wStat = options.followLinks && 'stat' || 'lstat';
    me._wStatSync = me._wStat + 'Sync';
    me._wsync = sync;
    me._wq = [];
    me._wqueue = [me._wq];
    me._wcurpath = undefined;
    me._wfilters = options.filters || [];
    me._wfirstrun = true;
    me._wcurpath = pathname;

    if (me._wsync) {
      //console.log('_walkSync');
      me._wWalk = me._wWalkSync;
    } else {
      //console.log('_walkASync');
      me._wWalk = me._wWalkAsync;
    }

    options.listeners = options.listeners || {};
    Object.keys(options.listeners).forEach(function (event) {
      var callbacks = options.listeners[event]
        ;

      if ('function' === typeof callbacks) {
        callbacks = [callbacks];
      }

      callbacks.forEach(function (callback) {
        me.on(event, callback);
      });
    });

    me._wWalk();
  }

  // Inherits must come before prototype additions
  util.inherits(Walker, EventEmitter);

  Walker.prototype._wLstatHandler = function (err, stat) {
    var me = this
      ;

    stat = stat || {};
    stat.name = me._wcurfile;

    if (err) {
      stat.error = err;
      //me.emit('error', curpath, stat);
      // TODO v3.0 (don't noop the next if there are listeners)
      me.emit('nodeError', me._wcurpath, stat, noop);
      me._wfnodegroups.errors.push(stat);
      me._wCurFileCallback();
    } else {
      TypeEmitter.sortFnodesByType(stat, me._wfnodegroups);
      // NOTE: wCurFileCallback doesn't need thisness, so this is okay
      TypeEmitter.emitNodeType(me, me._wcurpath, stat, me._wCurFileCallback, me);
    }
  };
  Walker.prototype._wFilesHandler = function (cont, file) {
    var statPath
      , me = this
      ;


    me._wcurfile = file;
    me._wCurFileCallback = cont;
    me.emit('name', me._wcurpath, file, noop);

    statPath = me._wcurpath + path.sep + file;

    if (!me._wsync) {
      // TODO how to remove this anony?
      fs[me._wStat](statPath, function (err, stat) {
        me._wLstatHandler(err, stat);
      });
      return;
    }

    try {
      me._wLstatHandler(null, fs[me._wStatSync](statPath));
    } catch(e) {
      me._wLstatHandler(e);
    }
  };
  Walker.prototype._wOnEmitDone = function () {
    var me = this
      , dirs = []
      ;

    me._wfnodegroups.directories.forEach(appendToDirs, dirs);
    dirs.forEach(me._wJoinPath, me);
    me._wqueue.push(me._wq = dirs);
    me._wNext();
  };
  Walker.prototype._wPostFilesHandler = function () {
    var me = this
      ;

    if (me._wfnodegroups.errors.length) {
      // TODO v3.0 (don't noop the next)
      // .errors is an array of stats with { name: name, error: error }
      me.emit('errors', me._wcurpath, me._wfnodegroups.errors, noop);
    }
    // XXX emitNodeTypes still needs refactor
    TypeEmitter.emitNodeTypeGroups(me, me._wcurpath, me._wfnodegroups, me._wOnEmitDone, me);
  };
  Walker.prototype._wReadFiles = function () {
    var me = this
      ;

    if (!me._wcurfiles || 0 === me._wcurfiles.length) {
      return me._wNext();
    }

    // TODO could allow user to selectively stat
    // and don't stat if there are no stat listeners
    me.emit('names', me._wcurpath, me._wcurfiles, noop);

    if (me._wsync) {
      me._wcurfiles.forEach(wFilesHandlerWrapper, me);
      me._wPostFilesHandler();
    } else {
      forEachAsync(me._wcurfiles, me._wFilesHandler, me).then(me._wPostFilesHandler);
    }
  };
  Walker.prototype._wReaddirHandler = function (err, files) {
    var fnodeGroups = TypeEmitter.createNodeGroups()
      , me = this
      , parent
      , child
      ;

    me._wfnodegroups = fnodeGroups;
    me._wcurfiles = files;

    // no error, great
    if (!err) {
      me._wReadFiles();
      return;
    }

    // TODO path.sep
    me._wcurpath = me._wcurpath.replace(/\/$/, '');

    // error? not first run? => directory error
    if (!me._wfirstrun) {
      // TODO v3.0 (don't noop the next if there are listeners)
      me.emit('directoryError', me._wcurpath, { error: err }, noop);
      // TODO v3.0
      //me.emit('directoryError', me._wcurpath.replace(/^(.*)\/.*$/, '$1'), { name: me._wcurpath.replace(/^.*\/(.*)/, '$1'), error: err }, noop);
      me._wReadFiles();
      return;
    }

    // error? first run? => maybe a file, maybe a true error
    me._wfirstrun = false;

    // readdir failed (might be a file), try a stat on the parent
    parent = me._wcurpath.replace(/^(.*)\/.*$/, '$1');
    fs[me._wStat](parent, function (e, stat) {

      if (stat) {
        // success
        // now try stat on this as a child of the parent directory
        child = me._wcurpath.replace(/^.*\/(.*)$/, '$1');
        me._wcurfiles = [child];
        me._wcurpath = parent;
      } else {
        // TODO v3.0
        //me.emit('directoryError', me._wcurpath.replace(/^(.*)\/.*$/, '$1'), { name: me._wcurpath.replace(/^.*\/(.*)/, '$1'), error: err }, noop);
        // TODO v3.0 (don't noop the next)
        // the original readdir error, not the parent stat error
        me.emit('nodeError', me._wcurpath, { error: err }, noop);
      }

      me._wReadFiles();
    });
  };
  Walker.prototype._wFilter = function () {
    var me = this
      , exclude
      ;

    // Stop directories that contain filter keywords
    // from continuing through the walk process
    exclude = me._wfilters.some(function (filter) {
      if (me._wcurpath.match(filter)) {
        return true;
      }
    });

    return exclude;
  };
  Walker.prototype._wWalkSync = function () {
    //console.log('walkSync');
    var err
      , files
      , me = this
      ;

    try {
      files = fs.readdirSync(me._wcurpath);
    } catch(e) {
      err = e;
    }

    me._wReaddirHandler(err, files);
  };
  Walker.prototype._wWalkAsync = function () {
    //console.log('walkAsync');
    var me = this
      ;

    // TODO how to remove this anony?
    fs.readdir(me._wcurpath, function (err, files) {
      me._wReaddirHandler(err, files);
    });
  };
  Walker.prototype._wNext = function () {
    var me = this
      ;

    if (me._paused) {
      return;
    }
    if (me._wq.length) {
      me._wcurpath = me._wq.pop();
      while (me._wq.length && me._wFilter()) {
        me._wcurpath = me._wq.pop();
      }
      if (me._wcurpath && !me._wFilter()) {
        me._wWalk();
      } else {
        me._wNext();
      }
      return;
    }
    me._wqueue.length -= 1;
    if (me._wqueue.length) {
      me._wq = me._wqueue[me._wqueue.length - 1];
      return me._wNext();
    }

    // To not break compatibility
    //process.nextTick(function () {
      me.emit('end');
    //});
  };
  Walker.prototype._wJoinPath = function (v, i, o) {
    var me = this
      ;

    o[i] = [me._wcurpath, path.sep, v].join('');
  };
  Walker.prototype.pause = function () {
    this._paused = true;
  };
  Walker.prototype.resume = function () {
    this._paused = false;
    this._wNext();
  };

  exports.walk = function (path, opts) {
    return new Walker(path, opts, false);
  };

  exports.walkSync = function (path, opts) {
    return new Walker(path, opts, true);
  };
}());


/***/ }),

/***/ 381:
/***/ (function(module) {

/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  // "FIFO" isn't easy to convert to camelCase and back reliably
  var isFnodeTypes = [
      "isFile", "isDirectory",  "isSymbolicLink", "isBlockDevice",  "isCharacterDevice", "isFIFO", "isSocket"
    ],
    fnodeTypes = [
      "file",   "directory",    "symbolicLink",   "blockDevice",    "characterDevice",    "FIFO",   "socket"
    ],
    fnodeTypesPlural = [
      "files",  "directories",  "symbolicLinks",  "blockDevices",   "characterDevices",   "FIFOs",  "sockets"
    ];


  // 
  function createNodeGroups() {
    var nodeGroups = {};
    fnodeTypesPlural.concat("nodes", "errors").forEach(function (fnodeTypePlural) {
      nodeGroups[fnodeTypePlural] = [];
    });
    return nodeGroups;
  }


  // Determine each file node's type
  // 
  function sortFnodesByType(stat, fnodes) {
    var i, isType;

    for (i = 0; i < isFnodeTypes.length; i += 1) {
      isType = isFnodeTypes[i];
      if (stat[isType]()) {
        stat.type = fnodeTypes[i];
        fnodes[fnodeTypesPlural[i]].push(stat);
        return;
      }
    }
  }


  // Get the current number of listeners (which may change)
  // Emit events to each listener
  // Wait for all listeners to `next()` before continueing
  // (in theory this may avoid disk thrashing)
  function emitSingleEvents(emitter, path, stats, next, self) {
    var num = 1 + emitter.listeners(stats.type).length + emitter.listeners("node").length;

    function nextWhenReady(flag) {
      if (flag) {
        stats.flag = flag;
      }
      num -= 1;
      if (0 === num) { next.call(self); }
    }

    emitter.emit(stats.type, path, stats, nextWhenReady);
    emitter.emit("node", path, stats, nextWhenReady);
    nextWhenReady();
  }


  // Since the risk for disk thrashing among anything
  // other than files is relatively low, all types are
  // emitted at once, but all must complete before advancing
  function emitPluralEvents(emitter, path, nodes, next, self) {
    var num = 1;

    function nextWhenReady() {
      num -= 1;
      if (0 === num) { next.call(self); }
    }

    fnodeTypesPlural.concat(["nodes", "errors"]).forEach(function (fnodeType) {
      if (0 === nodes[fnodeType].length) { return; }
      num += emitter.listeners(fnodeType).length;
      emitter.emit(fnodeType, path, nodes[fnodeType], nextWhenReady);
    });
    nextWhenReady();
  }

  module.exports = {
    emitNodeType: emitSingleEvents,
    emitNodeTypeGroups: emitPluralEvents,
    isFnodeTypes: isFnodeTypes,
    fnodeTypes: fnodeTypes,
    fnodeTypesPlural: fnodeTypesPlural,
    sortFnodesByType: sortFnodesByType,
    createNodeGroups: createNodeGroups
  };
}());


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __webpack_require__(87);
const path = __webpack_require__(622);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 614:
/***/ (function(module) {

module.exports = require("events");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 724:
/***/ (function(__unusedmodule, exports) {

/*jshint -W054 */
;(function (exports) {
  'use strict';

  function forEachAsync(arr, fn, thisArg) {
    var dones = []
      , index = -1
      ;

    function next(BREAK, result) {
      index += 1;

      if (index === arr.length || BREAK === forEachAsync.__BREAK) {
        dones.forEach(function (done) {
          done.call(thisArg, result);
        });
        return;
      }

      fn.call(thisArg, next, arr[index], index, arr);
    }

    setTimeout(next, 4);

    return {
      then: function (_done) {
        dones.push(_done);
        return this;
      }
    };
  }
  forEachAsync.__BREAK = {};

  exports.forEachAsync = forEachAsync;
}( true && exports || new Function('return this')()));


/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 877:
/***/ (function(module, __unusedexports, __webpack_require__) {

const fs = __webpack_require__(747);

function lint(filename, disabled = []) {

    const json = JSON.parse(fs.readFileSync(filename, 'utf8'));

    let fail_outputs = false;
    let fail_execution_count = false;

    for (let i = 0; i < json.cells.length; ++i) {

        const cell = json.cells[i];

        if (!fail_outputs && !disabled.includes('outputs') && has_key(cell, 'outputs')) {
            if (Array.from(cell['outputs']).length > 0) {
                fail_outputs = true;
            }
        }

        if (!fail_execution_count && !disabled.includes('execution_count') && has_key(cell, 'execution_count')) {
            if (cell['execution_count'] != null) {
                fail_execution_count = true;
            }
        }
    }

    // Warn users about which failures are present in this file
    if (fail_outputs) {
        console.log(`${filename}: nonempty outputs found`);
    }
    if (fail_execution_count) {
        console.log(`${filename}: non-null execution count found`);
    }

    return !(fail_outputs || fail_execution_count);
}

function has_key(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

module.exports = lint;


/***/ })

/******/ });