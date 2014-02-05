if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  var isArray = Array.isArray;
  var push = Array.prototype.push;
  var slice = Array.prototype.slice;
  var iterator = Array.prototype.iterator;
  var indexOf = Array.prototype.indexOf;
  var forEach = Array.prototype.forEach;
  var keys = Object.keys;
  var defineProperty = Object.defineProperty;
  var defineProperties = Object.defineProperties;
  var Tree = function () {
      function Tree(ast, options) {
        this.root = new Node(ast);
      }
      Tree.prototype.traverse = function (visitor) {
        visitor.call(this.root, this.root);
        this.root.traverse(visitor);
      };
      Tree.prototype.toAST = function () {
        return this.root.toAST();
      };
      return Tree;
    }();
  var Node = function () {
      function Node(ast, opts) {
        opts || (opts = {});
        defineProperties(this, {
          children: {value: new NodeSet(null, {
              parent: this,
              key: "children"
            })},
          nodeType: {value: "Node"},
          nodeKey: {value: opts.key || null},
          parent: {value: opts.parent || null}
        });
        this.set(ast);
      }
      Node.prototype.create = function (ast, opts) {
        return new (isArray(ast) ? NodeSet : Node)(ast, opts);
      };
      Node.prototype.clean = function () {
        var key;
        void function (_iterator) {
          try {
            while (true) {
              key = _iterator.next(), key = key.key;
              delete this[key];
            }
          } catch (e) {
            if (e !== StopIteration)
              throw e;
          }
        }.call(this, this.iterator());
        this.children = new NodeSet(null, {
          parent: this,
          key: "children"
        });
      };
      Node.prototype.set = function (ast) {
        var key;
        void function (_iterator) {
          try {
            while (true) {
              key = _iterator.next();
              if (typeof ast[key] === "object" && key !== "range" && ast[key] !== null) {
                this.append(this[key] = this.create(ast[key], {
                  parent: this,
                  key: key
                }));
              } else {
                this[key] = ast[key];
              }
            }
          } catch (e) {
            if (e !== StopIteration)
              throw e;
          }
        }.call(this, keys(ast).iterator());
      };
      Node.prototype.overload = function (ast) {
        this.clean();
        this.set(ast);
      };
      Node.prototype.append = function (node) {
        push.call(this.children, node);
      };
      Node.prototype.traverse = function (visitor) {
        var child;
        void function (_iterator) {
          try {
            while (true) {
              child = _iterator.next();
              visitor.call(child, child);
              child.traverse(visitor);
            }
          } catch (e) {
            if (e !== StopIteration)
              throw e;
          }
        }.call(this, this.children.iterator());
      };
      Node.prototype.iterator = function () {
        return {
          elements: keys(this).map(function (key) {
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
      };
      Node.prototype.toAST = function () {
        var ast = {};
        var key, value;
        void function (_iterator) {
          try {
            while (true) {
              key = _iterator.next(), value = key.value, key = key.key;
              ast[key] = typeof value === "object" ? value.toAST() : value;
            }
          } catch (e) {
            if (e !== StopIteration)
              throw e;
          }
        }.call(this, this.iterator());
        return ast;
      };
      return Node;
    }();
  var NodeSet = function (_super) {
      function __ctor() {
        this.constructor = NodeSet;
      }
      __ctor.prototype = _super.prototype;
      NodeSet.prototype = new __ctor();
      NodeSet.__super__ = _super.prototype;
      function NodeSet(items, opts) {
        opts || (opts = {});
        defineProperties(this, {
          nodeType: {value: "NodeSet"},
          nodeKey: {value: opts.key || null},
          parent: {value: opts.parent || null}
        });
        this.length = 0;
        items && items.forEach(function (item) {
          return push.call(this, this.create(item, {parent: this}));
        }.bind(this));
      }
      NodeSet.prototype.traverse = function (visitor) {
        var child;
        void function (_iterator) {
          try {
            while (true) {
              child = _iterator.next();
              visitor.call(child, child);
              child.traverse(visitor);
            }
          } catch (e) {
            if (e !== StopIteration)
              throw e;
          }
        }.call(this, this.iterator());
      };
      NodeSet.prototype.toAST = function () {
        return slice.call(this);
      };
      return NodeSet;
    }(Node);
  defineProperties(NodeSet.prototype, {
    iterator: {value: iterator},
    push: {value: push},
    slice: {value: slice},
    forEach: {value: forEach},
    indexOf: {value: indexOf}
  });
  exports.Tree = Tree;
});