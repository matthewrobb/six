if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var fs = require("fs");
  var path = require("path");
  var helpers = require("./helpers");
  var optparse = require("./optparse");
  var six = require("./six");
  var child_process = require("child_process"), spawn = child_process.spawn, exec = child_process.exec;
  var EventEmitter = require("events").EventEmitter;
  var exists = fs.exists || path.exists;
  helpers.extend(six, new EventEmitter());
  var printLine = function (line) {
    return process.stdout.write(line + "\n");
  };
  var printWarn = function (line) {
    return process.stderr.write(line + "\n");
  };
  var hidden = function (file) {
    return /^\.|~$/.test(file);
  };
  var SWITCHES = [
      [
        "-b",
        "--bare",
        "compile without a top-level function wrapper"
      ],
      [
        "-c",
        "--compile",
        "compile to JavaScript and save as .js files"
      ],
      [
        "-e",
        "--eval",
        "pass a string from the command line as input"
      ],
      [
        "-g",
        "--global",
        "put code directly into global scope rather than UMD define"
      ],
      [
        "-h",
        "--help",
        "display this help message"
      ],
      [
        "-i",
        "--interactive",
        "run an interactive Six REPL"
      ],
      [
        "-j",
        "--join [FILE]",
        "concatenate the source Six before compiling"
      ],
      [
        "-l",
        "--lint",
        "pipe the compiled JavaScript through JavaScript Lint"
      ],
      [
        "-n",
        "--nodes",
        "print out the parse tree that the parser produces"
      ],
      [
        "--nodejs [ARGS]",
        "pass options directly to the \"node\" binary"
      ],
      [
        "-o",
        "--output [DIR]",
        "set the output directory for compiled JavaScript"
      ],
      [
        "-p",
        "--print",
        "print out the compiled JavaScript"
      ],
      [
        "-r",
        "--require [FILE*]",
        "require a library before executing your script"
      ],
      [
        "-s",
        "--stdio",
        "listen for and compile scripts over stdio"
      ],
      [
        "-S",
        "--strict",
        "use strict mode inside of modules"
      ],
      [
        "-t",
        "--tokens",
        "print out the tokens that the lexer/rewriter produce"
      ],
      [
        "-v",
        "--version",
        "display the version number"
      ],
      [
        "-V",
        "--verbose",
        "increase verbosity"
      ],
      [
        "-w",
        "--watch",
        "watch scripts for changes and rerun commands"
      ]
    ];
  var opts = {};
  var sources = [];
  var sourceCode = [];
  var notSources = {};
  var watchers = {};
  var optionParser = null;
  var run = exports.run = function () {
      parseOptions();
      if (opts.nodejs)
        return forkNode();
      if (opts.help)
        return usage();
      if (opts.version)
        return version();
      if (opts.require)
        loadRequires();
      if (opts.interactive)
        return require("./repl");
      if (opts.watch && !fs.watch) {
        return printWarn("The --watch feature depends on Node v0.6.0+. You are running " + process.version + ".");
      }
      if (opts.stdio)
        return compileStdio();
      if (opts.eval)
        return compileScript(null, sources[0]);
      if (!sources.length)
        return require("./repl");
      var literals = opts.run ? sources.splice(1) : [];
      process.argv = process.argv.slice(0, 2).concat(literals);
      process.argv[0] = "six";
      process.execPath = require.main.filename;
      sources.forEach(function (source) {
        compilePath(source, true, path.normalize(source));
      });
    };
  var compilePath = function (source, topLevel, base) {
    fs.stat(source, function (err, stats) {
      if (err && err.code !== "ENOENT")
        throw err;
      if ((err != null ? err.code : void 0) === "ENOENT") {
        if (topLevel && source.slice(-4) !== ".six") {
          source = sources[sources.indexOf(source)] = "" + source + ".six";
          return compilePath(source, topLevel, base);
        }
        if (topLevel) {
          console.error("File not found: " + source);
          process.exit(1);
        }
        return;
      }
      if (stats.isDirectory()) {
        if (opts.watch)
          watchDir(source, base);
        fs.readdir(source, function (err, files) {
          var file;
          if (err && err.code !== "ENOENT")
            throw err;
          if ((err != null ? err.code : void 0) === "ENOENT")
            return;
          var index = sources.indexOf(source);
          files = files.filter(function (file) {
            return !hidden(file);
          });
          var _ref1;
          [].splice.apply(sources, [
            index,
            index - index + 1
          ].concat(_ref1 = function () {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              _results.push(path.join(source, file));
            }
            return _results;
          }())), _ref1;
          var _ref2;
          [].splice.apply(sourceCode, [
            index,
            index - index + 1
          ].concat(_ref2 = files.map(function () {
            return null;
          }))), _ref2;
          return files.forEach(function (file) {
            return compilePath(path.join(source, file), false, base);
          });
        });
      } else if (topLevel || path.extname(source) === ".six") {
        if (opts.watch)
          watch(source, base);
        fs.readFile(source, function (err, code) {
          if (err && err.code !== "ENOENT")
            throw err;
          if ((err != null ? err.code : void 0) === "ENOENT")
            return;
          return compileScript(source, code.toString(), base);
        });
      } else {
        notSources[source] = true;
        return removeSource(source, base);
      }
    });
  };
  var t, task;
  var compileScript = function (file, input, base) {
    var o = opts;
    var options = compileOptions(file);
    try {
      t = task = {
        file: file,
        input: input,
        options: options
      };
      six.emit("compile", task);
      if (o.tokens)
        printTokens(six.tokens(t.input));
      else if (o.nodes)
        printLine(six.nodes(t.input, t.options));
      else if (o.run)
        six.run(t.input, t.options);
      else if (o.join && t.file !== o.join) {
        sourceCode[sources.indexOf(t.file)] = t.input;
        compileJoin();
      } else {
        t.output = six.compile(t.input, t.options);
        six.emit("success", task);
        if (o.print)
          printLine(t.output.trim());
        else if (o.compile)
          writeJs(t.file, t.output, base);
        else if (o.lint)
          lint(t.file, t.output);
      }
    } catch (err) {
      six.emit("failure", err, task);
      if (six.listeners("failure").length)
        return;
      if (o.watch)
        return printLine(err.message + "\x07");
      printWarn(err instanceof Error && err.stack || "ERROR: " + err);
      return process.exit(1);
    }
  };
  var watch = function (source, base) {
    var watcher;
    var prevStats = null;
    var compileTimeout = null;
    var watchErr = function (e) {
      if (e.code === "ENOENT") {
        if (sources.indexOf(source) === -1)
          return;
        try {
          rewatch();
          compile();
        } catch (e) {
          removeSource(source, base, true);
          compileJoin();
        }
      } else {
        throw e;
      }
    };
    var compile = function () {
      clearTimeout(compileTimeout);
      compileTimeout = wait(25, function () {
        fs.stat(source, function (err, stats) {
          if (err)
            return watchErr(err);
          if (prevStats && stats.size === prevStats.size && stats.mtime.getTime() === prevStats.mtime.getTime())
            return rewatch();
          prevStats = stats;
          fs.readFile(source, function (err, code) {
            if (err)
              return watchErr(err);
            compileScript(source, code.toString(), base);
            rewatch();
          });
        });
      });
    };
    try {
      watcher = fs.watch(source, compile);
    } catch (e) {
      watchErr(e);
    }
    var rewatch = function () {
      watcher && watcher.close();
      watcher = fs.watch(source, compile);
    };
  };
  var watchDir = function (source, base) {
    var watcher;
    var readdirTimeout = null;
    try {
      watcher = fs.watch(source, function () {
        clearTimeout(readdirTimeout);
        readdirTimeout = wait(25, function () {
          fs.readdir(source, function (err, files) {
            if (err) {
              if (err && err.code !== "ENOENT")
                throw err;
              watcher.close();
              return unwatchDir(source, base);
            }
            files.forEach(function (file) {
              if (!(!hidden(file) && !notSources[file])) {
                file = path.join(source, file);
                if (sources.some(function (s) {
                    s.indexOf(file) >= 0;
                  })) {
                  sources.push(file);
                  sourceCode.push(null);
                  compilePath(file, false, base);
                }
              }
            });
          });
        });
      });
    } catch (e) {
      if (e.code !== "ENOENT")
        throw e;
    }
  };
  var unwatchDir = function (source, base) {
    var file, prevSources, toRemove, _i, _len;
    prevSources = sources.slice(0);
    toRemove = function () {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        file = sources[_i];
        if (file.indexOf(source) >= 0) {
          _results.push(file);
        }
      }
      return _results;
    }();
    for (_i = 0, _len = toRemove.length; _i < _len; _i++) {
      file = toRemove[_i];
      removeSource(file, base, true);
    }
    if (!sources.some(function (s, i) {
        return prevSources[i] !== s;
      })) {
      return;
    }
    return compileJoin();
  };
  var removeSource = function (source, base, removeJs) {
    var index = sources.indexOf(source);
    sources.splice(index, 1);
    sourceCode.splice(index, 1);
    if (removeJs && !opts.join) {
      var jsPath = outputPath(source, base);
      exists(jsPath, function (itExists) {
        if (itExists) {
          fs.unlink(jsPath, function (err) {
            if (err && err.code !== "ENOENT")
              throw err;
            return timeLog("removed " + source);
          });
        }
      });
    }
  };
  var outputPath = function (source, base) {
    var filename = path.basename(source, path.extname(source)) + ".js";
    var srcDir = path.dirname(source);
    var baseDir = base === "." ? srcDir : srcDir.substring(base.length);
    var dir = opts.output ? path.join(opts.output, baseDir) : srcDir;
    return path.join(dir, filename);
  };
  var writeJs = function (source, js, base) {
    var jsPath = outputPath(source, base);
    var jsDir = path.dirname(jsPath);
    var compile = function () {
      if (js.length <= 0)
        js = " ";
      fs.writeFile(jsPath, js, function (err) {
        if (err)
          printLine(err.message);
        else if (opts.compile && opts.watch)
          timeLog("compiled " + source);
      });
    };
    exists(jsDir, function (itExists) {
      if (itExists)
        compile();
      else
        exec("mkdir -p " + jsDir, compile);
    });
  };
  var wait = function (milliseconds, func) {
    return setTimeout(func, milliseconds);
  };
  var timeLog = function (message) {
    return console.log("" + new Date().toLocaleTimeString() + " - " + message);
  };
  var parseOptions = function () {
    var i, o, source, _i, _len;
    optionParser = new optparse.OptionParser(SWITCHES, "");
    o = opts = optionParser.parse(process.argv.slice(2));
    o.compile || (o.compile = !!o.output);
    o.run = !(o.compile || o.print || o.lint);
    o.print = !!(o.print || (o["eval"] || o.stdio && o.compile));
    sources = o["arguments"];
    for (i = _i = 0, _len = sources.length; _i < _len; i = ++_i) {
      source = sources[i];
      sourceCode[i] = null;
    }
  };
  var compileOptions = function (filename) {
    return {
      filename: filename,
      bare: opts.bare,
      header: opts.compile,
      verbose: opts.verbose,
      global: opts.global,
      strict: opts.strict
    };
  };
  var usage = function () {
    return printLine(new optparse.OptionParser(SWITCHES, "").help());
  };
  var version = function () {
    return printLine("SIX version 0.0.x");
  };
});