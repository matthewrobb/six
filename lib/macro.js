if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var path = require("path");
  var sweet = require("sweet.js");
  var macros = exports.macros = {};
  var require = exports.require = function (name) {
      if (!(name in macros)) {
        macros[name] = sweet.loadNodeModule(path.dirname(module.filename), "./macros/" + name + ".sjs");
      }
      return macros[name];
    };
  var expand = exports.expand = function (src, options) {
      return sweet.compile(src, {
        filename: options.filename,
        readableNames: true,
        modules: (options.macros || []).map(require)
      }).code;
    };
});