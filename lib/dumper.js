if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var Tree = require("./esom/tree").Tree;
  var dumpAst = exports.dumpAst = function (src, includeRanges) {
      var program = Tree.create(src);
      if (!includeRanges) {
        var delRange = function (node) {
            delete node.ast.range;
            node.children.forEach(delRange);
          }.bind(this);
        delRange(program.root);
      }
      return JSON.stringify(program.ast, null, 2);
    };
});