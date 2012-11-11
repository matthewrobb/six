if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  var isArray = Array.isArray;
  var keys = Object.keys;
  var defineProperty = Object.defineProperty;
  var Tree = function () {
      function Tree(ast, options) {
        this.root = new Node(ast);
      }
      Tree.prototype.toAST = function () {
        return this.root.toAST();
      };
      return Tree;
    }();
  var Node = function () {
      function Node(ast) {
        defineProperty(this, "children", {value: []});
        var key;
        void function (_iterator) {
          try {
            while (true) {
              key = _iterator.next();
              if (typeof ast[key] === "object" && key !== "range") {
                this.append(this[key] = new (isArray(ast[key]) ? NodeSet : Node)(ast[key]));
              } else {
                this[key] = ast[key];
              }
            }
          } catch (e) {
            if (e !== StopIteration)
              throw e;
          }
        }.call(this, keys(ast).iterator());
      }
      Node.prototype.append = function (node) {
        this.children.push(node);
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
      function NodeSet(items) {
        this.length = 0;
        items.forEach(function (item) {
          return this.push(item);
        }.bind(this));
      }
      NodeSet.prototype.toAST = function () {
        return this.slice();
      };
      return NodeSet;
    }(Array);
  exports.Tree = Tree;
});