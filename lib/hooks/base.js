if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
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
      ".BinaryExpression[operator^='is']": function (node) {
        node.compile = function () {
          return filters.egal(node);
        }.bind(this);
      }.bind(this),
      ".TemplateLiteral": function (node) {
        node.compile = function () {
          return filters.quasi(node.context());
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