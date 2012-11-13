if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  require("./es6");
  var esprima = require("esprima-six");
  var parse = esprima.parse;
  var esgen = require("escodegen").generate;
  var Tree = require("./tree").Tree;
  var hooks = require("./hooks").hooks;
  var config = exports.config = {
      format: {
        indent: {style: "    "},
        quotes: "double",
        compact: false
      },
      comment: true
    };
  var rewrite = exports.rewrite = function (src, options) {
      var sourceTree = new Tree(parse(src), options);
      var hook;
      void function (_iterator) {
        try {
          while (true) {
            hook = _iterator.next();
            hook(sourceTree, options);
          }
        } catch (e) {
          if (e !== StopIteration)
            throw e;
        }
      }.call(this, hooks.iterator());
      return esgen(sourceTree.toAST(), config);
    };
});