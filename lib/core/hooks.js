if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  var esprima = require("esprima-six");
  var parse = esprima.parse;
  var hooks = exports.hooks = [];
  hooks.push(function (tree) {
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
    tree.traverse(function (node) {
      if (node.type === "BinaryExpression" && /^is/.test(node.operator)) {
        node.overload(egaller(node.left.toAST(), node.right.toAST()));
      }
    }.bind(this));
  }.bind(this));
});