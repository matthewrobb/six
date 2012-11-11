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
      var egal = parse("(function ( x, y ) { return (x === y)?( x !== 0 || 1/x === 1/y ) : ( x !== x && y !==y )})()").body[0].expression;
      var egaller = function (left, right) {
        return {
          type: egal.type,
          arguments: [
            left,
            right
          ],
          callee: egal.callee
        };
      };
      sourceTree.traverse(function (node) {
        if (node.type === "BinaryExpression" && /^is/.test(node.operator)) {
          node.overload(egaller(node.left.toAST(), node.right.toAST()));
        }
      }.bind(this));
      result = esgen(sourceTree.toAST(), config);
      console.log(result);
      return result;
    };
});