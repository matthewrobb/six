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
  var Tree = require("./esom/tree").Tree;
  var config = {
      format: {
        indent: {style: "    "},
        quotes: "double",
        compact: false
      },
      comment: true
    };
  var rewrite = exports.rewrite = function (src, options) {
      var sourceTree, result;
      sourceTree = new Tree(parse(src), options);
      result = esgen(sourceTree.toAST(), config);
      console.log(result);
      return result;
    };
});