if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var hooks = {
      ".ForOfStatement": function (node) {
        node.compile = function () {
          var context = node.context();
          var right = context.right.compile();
          var body = context.body.compile().replace(/^{([\s\S]*)}$/, "$1");
          var dec = context.left.matches(".VariableDeclaration[kind='var']");
          var decs = [];
          var left = dec ? context.left.declarations.node.first().context() : context.left.node.context();
          if (left.type === "Identifier" || left.id && left.id.type === "Identifier") {
            decs.push(left.compile());
            left = function (__quasi__) {
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
                " = _iterator.next()"
              ],
              "raw": [
                "",
                " = _iterator.next()"
              ]
            }, left.compile());
          } else if (left.type === "VariableDeclarator" && left.id.type === "ObjectPattern") {
            left.select(".ObjectPattern").forEach(function (node) {
              decs = decs.concat(node.properties().map(function (prop) {
                return prop.key;
              }.bind(this)));
              left = node.assemble("_iterator.next()");
            }.bind(this));
          } else {
            left = function (__quasi__) {
              var rawStrs = __quasi__["cooked"];
              var out = [];
              for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
                out[++k] = rawStrs[i];
                out[++k] = arguments[++i];
              }
              return out.join("");
            }({
              "cooked": [
                "(",
                ")"
              ],
              "raw": [
                "(",
                ")"
              ]
            }, left.compile());
          }
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
              "        ",
              "        void function(_iterator){          try {            while (true) {              ",
              "              ",
              "            }          } catch (e) { if (e !== StopIteration ) throw e }        }.call(this, ",
              ".iterator());      "
            ],
            "raw": [
              "\n        ",
              "\n        void function(_iterator){\n          try {\n            while (true) {\n              ",
              "\n              ",
              "\n            }\n          } catch (e) { if (e !== StopIteration ) throw e }\n        }.call(this, ",
              ".iterator());\n      "
            ]
          }, dec ? "var " + decs.join(", ") + ";" : "", left, body, right);
        }.bind(this);
      }.bind(this)
    };
  Object.define(exports, hooks);
});