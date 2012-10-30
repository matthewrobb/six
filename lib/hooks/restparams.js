if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  var hooks = {".FunctionDeclaration": function (node) {
        var ctx = node.context();
        if (!ctx.params.node)
          return;
        var params = ctx.params.node.children;
        var lastIdx = params.length - 1;
        var lastParam = params[lastIdx];
        if (lastParam.ast.type === "RestParameter") {
          var restParamName = lastParam.ast.value.name;
          params.pop();
          ctx.params.node.compile = function () {
            return params.map(function (p) {
              return p.context().name;
            }.bind(this)).join(", ");
          }.bind(this);
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
              }, restParamName, lastIdx);
            }
          });
        }
      }.bind(this)};
  Object.define(exports, hooks);
});