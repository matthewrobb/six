if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  require("./es6");
  var Tree = require("./esom/tree").Tree;
  var hooks = require("./hooks/base");
  var visitors = {};
  function optimizeHooks() {
    var sels = Object.keys(hooks);
    var optimizable = /^\.[a-zA-Z]+$/;
    var sel;
    void function (_iterator) {
      try {
        while (true) {
          sel = _iterator.next();
          if (optimizable.exec(sel)) {
            visitors[sel.substring(1)] = hooks[sel];
            delete hooks[sel];
          }
        }
      } catch (e) {
        if (e !== StopIteration)
          throw e;
      }
    }.call(this, sels.iterator());
  }
  optimizeHooks();
  var rewrite = exports.rewrite = function (src, options) {
      var program = Tree.create(src, options);
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
      program.root.visitByType(visitors);
      return program.compile();
    };
  Object.define(Tree.prototype, {
    compile: function () {
      var src = typeof this.raw === "function" ? this.raw() : this.raw;
      this.children.reverse().forEach(function (child) {
        var raw = typeof child.raw === "function" ? child.raw() : child.raw;
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
        var parent;
        Object.define(stack, node.ast);
        Object.define(stack, {
          node: node,
          get parent() {
            parent ? parent : node.parent ? parent = node.parent.context() : undefined;
          }
        });
        if (stack.hasOwnProperty("loc"))
          delete stack["loc"];
        node.children.forEach(function (child) {
          var ctx;
          Object.defineProperty(stack, child.key, {
            get: function () {
              return ctx ? ctx : ctx = child.context();
            },
            enumerable: true
          });
        }.bind(this));
        return stack;
      }
      return Context;
    }();
});