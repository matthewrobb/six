if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  var existsSync = require("fs").existsSync;
  var sep = require("path").sep;
  var hooks = {
      ".ModuleDeclaration": function (node) {
        var compile = node.compile;
        node.compile = function () {
          var ret = "var ";
          var ctx = node.context();
          var from = ctx.from;
          if (!from)
            return compile.call(node);
          if (function (x, y) {
              return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
            }(from.type, "Literal")) {
            var modRoot = from.value;
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
                " = require(\"",
                "\");"
              ],
              "raw": [
                "var ",
                " = require(\"",
                "\");"
              ]
            }, ctx.id.name, modRoot);
          } else {
            var modRoot = from.compile();
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
                " = ",
                ";"
              ],
              "raw": [
                "var ",
                " = ",
                ";"
              ]
            }, ctx.id.name, modRoot);
          }
        }.bind(this);
      }.bind(this),
      ".ImportDeclaration": function (node) {
        node.compile = function () {
          var ret = "var ";
          var ctx = node.context();
          var from = ctx.from;
          if (function (x, y) {
              return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
            }(from.type, "Literal")) {
            var modRoot = from.value;
            var modVarName = modRoot.replace("/", "_");
            modRoot = function (__quasi__) {
              var rawStrs = __quasi__["cooked"];
              var out = [];
              for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
                out[++k] = rawStrs[i];
                out[++k] = arguments[++i];
              }
              return out.join("");
            }({
              "cooked": [
                "require(\"",
                "\")"
              ],
              "raw": [
                "require(\"",
                "\")"
              ]
            }, modRoot);
          } else {
            from = from.context().body.node;
            var modNames = from.children.map(function (path) {
                return path.context().name;
              }.bind(this));
            var modVarName = modNames.join("_");
            var modRoot = from.compile();
          }
          var specifiers = ctx.specifiers.node.children;
          if (function (x, y) {
              return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
            }(specifiers.length, 1)) {
            modVarName = modRoot;
          } else {
            ret += function (__quasi__) {
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
                ""
              ],
              "raw": [
                "",
                " = ",
                ""
              ]
            }, modVarName, modRoot);
          }
          specifiers.forEach(function (spec) {
            if (specifiers.length > 1)
              ret += ", ";
            var ctx = spec.context();
            if (function (x, y) {
                return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
              }(ctx.type, "ImportSpecifier")) {
              var name = ctx.id.name;
              var from = ctx.from ? ctx.from.node.children[0].ast[0].name : name;
              ret += function (__quasi__) {
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
              }, from, modVarName, name);
            } else {
              ret += function (__quasi__) {
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
              }, ctx.name, modVarName, ctx.name);
            }
          }.bind(this));
          return ret + ";";
        }.bind(this);
      }.bind(this)
    };
  Object.define(exports, hooks);
});