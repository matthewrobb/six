var Context, Tree = require("./esom/tree").Tree, filters = require("./filters").filters;

function rewrite(src) {
  var program = Tree.create(src);
  program.select(".BinaryExpression[operator^='is']").forEach(function(node) {
    return node.compile = function() {
      return filters.egal(node);
    };
  });
  program.select(".QuasiLiteral").forEach(function(node) {
    return node.compile = function() {
      return filters.quasi(node.context());
    };
  });
  function ClassRewrite(node) {
    var constructor, ctx = node.context(), methods = [];
    if (ctx.body && ctx.body.body) {
      ctx.body.body.node.children.forEach(function(child) {
        var sub = child.context();
        if (sub.key.node.matches(".Identifier[name='constructor']")) constructor = sub; else methods.push(sub);
      });
    }
    Object.define(ctx, {
      get constructor() {
        return constructor;
      },
      get methods() {
        return methods;
      }
    });
    return filters.class(ctx);
  }
  program.select(".ClassDeclaration").forEach(function(node) {
    return node.compile = function() {
      return ClassRewrite(node);
    };
  });
  program.select(".ClassExpression").forEach(function(node) {
    return node.compile = function() {
      return ClassRewrite(node);
    };
  });
  program.select(".CallExpression > .MemberExpression > .Identifier[name='super']").forEach(function(node) {
    var argsc, Call = node.closest(".CallExpression").context(), callee = Call.callee, args = Call.arguments;
    if (args && args.compile) {
      argsc = args = args.compile();
    }
    node.compile = function() {
      return "this.constructor.__super__";
    };
    callee.property.node.compile = function() {
      return callee.property.name + ".call";
    };
    if (args && args.node) args.node.compile = function() {
      return function(__quasi__) {
        var i, k, n, rawStrs = __quasi__["raw"], out = [];
        for (i = 0, k = -1, n = rawStrs.length; i < n; ) {
          out[++k] = rawStrs[i];
          out[++k] = arguments[++i];
        }
        return out.join("");
      }({
        cooked: [ "this", "" ],
        raw: [ "this", "" ]
      }, args.node ? "," + argsc : "");
    };
  });
  program.select(".CallExpression > callee[name='super']").forEach(function(node) {
    var Call = node.parent.context(), args = Call.arguments;
    if (args && args.compile) {
      args = args.compile();
    }
    Call.node.compile = function() {
      return function(__quasi__) {
        var i, k, n, rawStrs = __quasi__["raw"], out = [];
        for (i = 0, k = -1, n = rawStrs.length; i < n; ) {
          out[++k] = rawStrs[i];
          out[++k] = arguments[++i];
        }
        return out.join("");
      }({
        cooked: [ "this.constructor.__super__.constructor.call(this ", ")" ],
        raw: [ "this.constructor.__super__.constructor.call(this ", ")" ]
      }, args.node ? "," + args : "");
    };
  });
  program.select(".ForOfStatement").forEach(function(node) {
    node.compile = function() {
      var context = node.context(), dec = context.left.matches(".VariableDeclaration[kind='var']"), left = dec ? context.left.declarations.compile() : context.left.compile(), right = context.right.compile(), body = context.body.compile();
      return function(__quasi__) {
        var i, k, n, rawStrs = __quasi__["raw"], out = [];
        for (i = 0, k = -1, n = rawStrs.length; i < n; ) {
          out[++k] = rawStrs[i];
          out[++k] = arguments[++i];
        }
        return out.join("");
      }({
        cooked: [ "        ", "        void function(_iterator){          try {            while (", " = _iterator.next()) ", "          } catch (e) { if (e !== StopIteration ) throw e }        }.call(this, ", ".iterator());      " ],
        raw: [ "\r\n        ", "\r\n        void function(_iterator){\r\n          try {\r\n            while (", " = _iterator.next()) ", "\r\n          } catch (e) { if (e !== StopIteration ) throw e }\r\n        }.call(this, ", ".iterator());\r\n      " ]
      }, dec ? context.left.compile() + ";" : "", left, body, right);
    };
  });
  return program.compile();
}

Object.define(Tree.prototype, {
  compile: function() {
    var src = this.raw();
    this.children.reverse().forEach(function(child) {
      var raw = child.raw(), start = src.indexOf(raw), end = start + raw.length;
      src = src.substring(0, start) + child.compile() + src.substring(end);
    });
    return src;
  },
  context: function() {
    var ctx = new Context(this);
    return ctx;
  }
});

Context = function() {
  function Context(node) {
    var stack = Object.create(node);
    Object.define(stack, node.ast);
    Object.define(stack, {
      node: node,
      get parent() {
        if (node.parent) return node.parent.context();
      }
    });
    if (stack.hasOwnProperty("loc")) delete stack["loc"];
    node.children.forEach(function(child) {
      var ctx = child.context();
      Object.defineProperty(stack, child.key, {
        get: function() {
          return ctx;
        },
        enumerable: true
      });
    });
    return stack;
  }
  return Context;
}();

exports.rewrite = rewrite;