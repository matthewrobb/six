if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var fs = require("fs");
  var path = require("path");
  var rewrite = require("./rewriter").rewrite;
  var dumpAst = require("./dumper").dumpAst;
  var run = exports.run = function (code, options) {
      var mainModule = require.main;
      if (!options)
        options = {};
      mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : ".";
      mainModule.moduleCache && (mainModule.moduleCache = {});
      mainModule.paths = require("module")._nodeModulePaths(path.dirname(fs.realpathSync(options.filename)));
      if (path.extname(mainModule.filename) !== ".six" || require.extensions) {
        mainModule._compile(compile(code, options), mainModule.filename);
      } else {
        mainModule._compile(code, mainModule.filename);
      }
    };
  var compile = exports.compile = function (src, options, callback) {
      src = rewrite(src, options);
      return src;
    };
  var nodes = exports.nodes = function (src, options) {
      return dumpAst(src, options.verbose);
    };
  if (require && require.extensions) {
    require.extensions[".six"] = function (module, filename) {
      var content = compile(fs.readFileSync(filename, "utf8"));
      return module._compile(content, filename);
    };
  }
});