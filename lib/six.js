var rewrite, harmonize, moduleStyles, run, fs = require("fs"), path = require("path"), harmonizr = require("./harmonizr");

require("./es6");

rewrite = require("./rewriter").rewrite;

harmonize = exports.harmonize = harmonizr.harmonize;

moduleStyles = exports.modulesStyles = harmonizr.modulesStyles;

run = exports.run = function(code, options) {
  var mainModule = require.main;
  if (!options) options = {};
  mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : ".";
  mainModule.moduleCache && (mainModule.moduleCache = {});
  mainModule.paths = require("module")._nodeModulePaths(path.dirname(fs.realpathSync(options.filename)));
  if (path.extname(mainModule.filename) !== ".js" || require.extensions) {
    mainModule._compile(compile(code, options), mainModule.filename);
  } else {
    mainModule._compile(code, mainModule.filename);
  }
};

function compile(src, options) {
  src = harmonize(src, options);
  src = rewrite(src);
  return src;
}

exports.compile = compile;