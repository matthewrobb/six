if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var hooks = {
      ".VariableDeclarator > id.ObjectPattern": function (node) {
        node.properties = function () {
          var ctx = node.parent.context();
          var props = [];
          ctx.id.properties.node.children.forEach(function (child) {
            var prop = child.context();
            var key = prop.key.compile();
            var value = prop.value.compile();
            props.push({
              key: key,
              value: value
            });
          }.bind(this));
          return props;
        }.bind(this);
        node.assemble = function (init) {
          var ctx = node.parent.context();
          var props = node.properties();
          var result = "";
          if (!ctx.init || !ctx.init.matches(".Identifier") && props.length > 1) {
            var first = props.shift();
            result += function (__quasi__) {
              var rawStrs = __quasi__["cooked"];
              var out = [];
              for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
                out[++k] = rawStrs[i];
                out[++k] = arguments[++i];
              }
              return out.join("");
            }({
              "cooked": [
                "",
                " = ",
                ", "
              ],
              "raw": [
                "",
                " = ",
                ", "
              ]
            }, first.key, init);
            props.push(first);
            init = first.key;
          }
          props = props.map(function (prop, index) {
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
                "",
                " = ",
                ".",
                ""
              ],
              "raw": [
                "",
                " = ",
                ".",
                ""
              ]
            }, prop.key, init, prop.value);
          }.bind(this));
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
              "",
              "",
              ""
            ],
            "raw": [
              "",
              "",
              ""
            ]
          }, result, props.join(", "));
        }.bind(this);
        node.parent.compile = function () {
          return node.assemble(node.parent.context().init.compile());
        }.bind(this);
      }.bind(this)
    };
  Object.define(exports, hooks);
});