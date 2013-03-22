if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var hooks = {
      ".FunctionDeclaration": function (node) {
        var ctx = node.context();
        if (!ctx.rest)
          return;
        var paramsLength = ctx.params.node ? ctx.params.node.children.length : 0;
        var restParamName = ctx.rest.name;
        ctx.body.body.unshift({
          raw: function () {
            return "";
          },
          compile: function () {
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
                "var ",
                " = [].slice.call(arguments, ",
                ");"
              ],
              "raw": [
                "var ",
                " = [].slice.call(arguments, ",
                ");"
              ]
            }, restParamName, paramsLength);
          }
        });
      }.bind(this)
    };
  Object.define(exports, hooks);
});