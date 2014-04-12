if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var filters = require("../filters").filters;
  function ClassRewrite(node) {
    var ctx = node.context();
    var constructor;
    var methods = [];
    if (ctx.body && ctx.body.body && ctx.body.body.node) {
      ctx.body.body.node.children.forEach(function (child) {
        var sub = child.context();
        if (sub.key.node.matches(".Identifier[name='constructor']"))
          constructor = sub;
        else
          methods.push(sub);
      }.bind(this));
    }
    ctx.constructor = constructor;
    ctx.methods = methods;
    return filters.class(ctx);
  }
  Object.define(exports, {
    ".ClassDeclaration": function (node) {
      node.compile = function () {
        return ClassRewrite(node);
      }.bind(this);
    }.bind(this),
    ".ClassExpression": function (node) {
      node.compile = function () {
        return ClassRewrite(node);
      }.bind(this);
    }.bind(this),
    ".CallExpression > .MemberExpression > .Identifier[name='super']": function (node) {
      var Call = node.closest(".CallExpression").context();
      var callee = Call.callee;
      var args = Call.arguments;
      if (args && args.compile) {
        var argsc = args = args.compile();
      }
      node.compile = function () {
        return "this.constructor.__super__";
      }.bind(this);
      callee.property.node.compile = function () {
        return callee.property.name + ".call";
      }.bind(this);
      if (args && args.node)
        args.node.compile = function () {
          return function (__quasi__) {
            var rawStrs = __quasi__["cooked"];
            var out = [];
            for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
              out[++k] = rawStrs[i];
              out[++k] = arguments[++i];
            }
            return out.join("");
          }({
            "cooked": [
              "this",
              ""
            ],
            "raw": [
              "this",
              ""
            ]
          }, args.node ? "," + argsc : "");
        }.bind(this);
    }.bind(this),
    ".CallExpression > callee[name='super']": function (node) {
      var Call = node.parent.context();
      var args = Call.arguments;
      if (args && args.compile) {
        args = args.compile();
      }
      Call.node.compile = function () {
        return function (__quasi__) {
          var rawStrs = __quasi__["cooked"];
          var out = [];
          for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
            out[++k] = rawStrs[i];
            out[++k] = arguments[++i];
          }
          return out.join("");
        }({
          "cooked": [
            "this.constructor.__super__.constructor.call(this ",
            ")"
          ],
          "raw": [
            "this.constructor.__super__.constructor.call(this ",
            ")"
          ]
        }, args.node ? "," + args : "");
      }.bind(this);
    }.bind(this)
  });
});