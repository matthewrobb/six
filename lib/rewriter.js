require("./es6");
var Tree = require("./esom/tree").Tree;
var hooks = require("./hooks/base");
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