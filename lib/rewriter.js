var generate = require("escodegen").generate;
require("./es6");
var Tree = require("./esom/tree").Tree;
function rewrite(src) {
  var program = Tree.create(src);
  var selector, hook;
  void function (_iterator) {
    try {
      while (true) {
        selector = _iterator.next(), hook = selector.value, selector = selector.key;
        program.root.select(selector).forEach(hook);
      }
    } catch (e) {
      if (e !== StopIteration)
        throw e;
    }
  }.call(this, hooks.iterator());
  return program.compile();
}
var filters = require("./filters").filters;
var hooks = Object.create({iterator: function () {
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
    }});
Object.define(hooks, require("./hooks/classes"));
Object.define(hooks, {
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
  }.bind(this),
  ".BinaryExpression[operator^='is']": function (node) {
    node.compile = function () {
      return filters.egal(node);
    }.bind(this);
  }.bind(this),
  ".QuasiLiteral": function (node) {
    node.compile = function () {
      return filters.quasi(node.context());
    }.bind(this);
  }.bind(this),
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
          "\r\n        ",
          "\r\n        void function(_iterator){\r\n          try {\r\n            while (true) {\r\n              ",
          "\r\n              ",
          "\r\n            }\r\n          } catch (e) { if (e !== StopIteration ) throw e }\r\n        }.call(this, ",
          ".iterator());\r\n      "
        ]
      }, dec ? "var " + decs.join(", ") + ";" : "", left, body, right);
    }.bind(this);
  }.bind(this),
  ".Program": function (node) {
    var compile = node.compile;
    node.compile = function () {
      var src = compile.call(node);
      return generate(Tree.create(src).ast, {
        format: {
          indent: {
            style: "  ",
            base: 0
          },
          quotes: "double",
          compact: false
        },
        comment: true
      });
    }.bind(this);
  }.bind(this)
});
Object.define(Tree.prototype, {
  compile: function () {
    var src = this.raw();
    this.children.reverse().forEach(function (child) {
      var raw = child.raw();
      var start = src.indexOf(raw);
      var end = start + raw.length;
      src = src.substring(0, start) + child.compile() + src.substring(end);
    }.bind(this));
    return src;
  },
  context: function () {
    var ctx = new Context(this);
    return ctx;
  }
});
var Context = function () {
    function Context(node) {
      var stack = Object.create(node);
      Object.define(stack, node.ast);
      Object.define(stack, {
        node: node,
        get parent() {
          if (node.parent)
            return node.parent.context();
        }
      });
      if (stack.hasOwnProperty("loc"))
        delete stack["loc"];
      node.children.forEach(function (child) {
        var ctx = child.context();
        Object.defineProperty(stack, child.key, {
          get: function () {
            return ctx;
          },
          enumerable: true
        });
      }.bind(this));
      return stack;
    }
    return Context;
  }();
exports.rewrite = rewrite;