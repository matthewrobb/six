
var fs = require("fs")
var path = require("path")

var { harmonize } = require("./harmonizr")
var { rewrite } = require("./rewriter")

function run (code, options) {
  var mainModule = require.main

  if(!options) options = {}

  mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : '.'
  mainModule.moduleCache && (mainModule.moduleCache = {})
  mainModule.paths = require('module')._nodeModulePaths(path.dirname(fs.realpathSync(options.filename)))

  if (path.extname(mainModule.filename) !== '.js' || require.extensions) {
    mainModule._compile(compile(code, options), mainModule.filename)
  } else {
    mainModule._compile(code, mainModule.filename)
  }
}

function compile (src, options, callback) {
  src = harmonize(src, options)
  src = rewrite(src)
  return src
}

Object.define(exports, { run, compile, harmonize })