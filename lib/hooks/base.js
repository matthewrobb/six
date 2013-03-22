if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var generate = require("escodegen").generate;
  var filters = require("../filters").filters;
  function iterator() {
    return {
      elements: Object.keys(this).map(function (key) {
        return {
          key: key,
          value: this[key]
        };
      }.bind(this)),
      index: 0,
      next: function () {
        if (this.index >= this.elements.length)
          throw StopIteration;
        return this.elements[this.index++];
      }
    };
  }
  var hooks = {
      ".Program": function (node) {
        var compile = node.compile;
        node.compile = function () {
          var src = compile.call(node);
          var body = generate(node.constructor.create(src).ast, {
              format: {
                indent: {
                  style: "  ",
                  base: node.global ? 0 : 1
                },
                quotes: "double",
                compact: false
              },
              comment: true
            });
          if (node.strict)
            body = "  \"use strict\";\n" + body;
          if (!node.global) {
            body = "if (typeof exports === 'object' && typeof define !== 'function') {\n" + "  var define = function (factory) {\n" + "    factory(require, exports);\n" + "  };\n" + "}\n" + "define(function (require, exports) {\n" + body + "\n});";
          }
          return body;
        }.bind(this);
      }.bind(this),
      ".ArrowFunctionExpression": function (node) {
        node.compile = function () {
          var ctx = node.context();
          var params = ctx.params.compile ? ctx.params.compile() : "";
          var body = ctx.body.compile(), body = ctx.expression ? function (__quasi__) {
              var rawStrs = __quasi__["cooked"];
              var out = [];
              for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
                out[++k] = rawStrs[i];
                out[++k] = arguments[++i];
              }
              return out.join("");
            }({
              "cooked": [
                "{return ",
                "}"
              ],
              "raw": [
                "{return ",
                "}"
              ]
            }, body) : body;
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
              "function(",
              ")",
              ".bind(this)"
            ],
            "raw": [
              "function(",
              ")",
              ".bind(this)"
            ]
          }, params, body);
        }.bind(this);
      }.bind(this),
      ".Property[method=true]": function (node) {
        node.compile = function () {
          var ctx = node.context();
          var key = ctx.key.compile();
          var value = ctx.value;
          var params = value.params && value.params.compile ? value.params.compile() : "";
          var body = value.body.compile(), body = value.expression ? function (__quasi__) {
              var rawStrs = __quasi__["cooked"];
              var out = [];
              for (var i = 0, k = -1, n = rawStrs.length; i < n;) {
                out[++k] = rawStrs[i];
                out[++k] = arguments[++i];
              }
              return out.join("");
            }({
              "cooked": [
                "{return ",
                "}"
              ],
              "raw": [
                "{return ",
                "}"
              ]
            }, body) : body;
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
              ":function(",
              ")",
              ""
            ],
            "raw": [
              "",
              ":function(",
              ")",
              ""
            ]
          }, key, params, body);
        }.bind(this);
      }.bind(this),
      ".Property[shorthand=true]": function (node) {
        node.compile = function () {
          var ctx = node.context();
          var key = ctx.key.compile();
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
              ":",
              ""
            ],
            "raw": [
              "",
              ":",
              ""
            ]
          }, key, key);
        }.bind(this);
      }.bind(this),
      ".BinaryExpression[operator^='is']": function (node) {
        node.compile = function () {
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
              "(",
              "function ( x, y ) {        return (x === y)?( x !== 0 || 1/x === 1/y ) : ( x !== x && y !==y )      }( ",
              ", ",
              " ))"
            ],
            "raw": [
              "(",
              "function ( x, y ) {\n        return (x === y)?( x !== 0 || 1/x === 1/y ) : ( x !== x && y !==y )\n      }( ",
              ", ",
              " ))"
            ]
          }, node.ast.operator === "isnt" ? "!" : "", node.first().compile(), node.last().compile());
        }.bind(this);
      }.bind(this),
      ".TemplateLiteral": function (node) {
        node.compile = function () {
          var it = node.context();
          var cooked = [], raw = [];
          it.quasis.node.children.forEach(function (child) {
            raw.push(child.ast.value.raw);
            cooked.push(child.ast.value.cooked);
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
              "(function(__quasi__){        var rawStrs = __quasi__['cooked'];        var out = [];        for (var i = 0, k = -1, n = rawStrs.length; i < n;) {          out[++k] = rawStrs[i];          out[++k] = arguments[++i];        }        return out.join('');      })(        ",
              "        ",
              "      )"
            ],
            "raw": [
              "(function(__quasi__){\n        var rawStrs = __quasi__['cooked'];\n        var out = [];\n        for (var i = 0, k = -1, n = rawStrs.length; i < n;) {\n          out[++k] = rawStrs[i];\n          out[++k] = arguments[++i];\n        }\n        return out.join('');\n      })(\n        ",
              "\n        ",
              "\n      )"
            ]
          }, JSON.stringify({
            cooked: cooked,
            raw: raw
          }), it.expressions && it.expressions.node && it.expressions.node.children.length ? "," + it.expressions.node.children.map(function (exp) {
            return exp.compile();
          }).join(",") : "");
        }.bind(this);
      }.bind(this)
    };
  Array.prototype.map.call([
    hooks,
    "./classes",
    "./forof",
    "./objectpattern",
    "./modules",
    "./restparams"
  ], function (hook) {
    Object.define(exports, typeof hook === "string" ? require(hook) : hook);
  }.bind(this));
  Object.defineProperty(exports, "iterator", {
    value: iterator,
    enumerable: false
  });
});