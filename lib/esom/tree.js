if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var esprima = require("esprima-six-jpike");
  var parse = esprima.parse;
  var Syntax = esprima.Syntax;
  var Tree = exports.Tree = function () {
      function Tree(source, options) {
        var ast = parse(source, { range: true });
        var children = [];
        this.root = this;
        this.source = source;
        this.ast = ast;
        this.children = children;
        children.push(this.create({
          ast: ast,
          key: "root",
          type: "Node"
        }));
        var node = children[0];
        node.global = options && options.global;
        node.strict = options && options.strict;
        return node;
      }
      Tree.prototype.create = function (base) {
        var node = Object.create(this.root);
        var parent = this;
        var children = [];
        Object.define(node, base);
        node.climb(function (child) {
          if (child.type === "Node" || child.type === "NodeSet" && child.ast.length) {
            if (child.type === "NodeSet") {
              child.ast.range = [
                child.ast[0].range[0],
                child.ast[child.ast.length - 1].range[1]
              ];
            }
            children.push(node.create(child));
          }
        }.bind(this));
        node.ast = base.ast;
        node.parent = parent;
        node.children = children;
        Object.define(node, {
          unshift: function (node) {
            children.unshift(node);
          },
          push: function (node) {
            children.push(node);
          }
        });
        return node;
      };
      Tree.prototype.climb = function (visit) {
        var node = this.ast;
        Object.keys(node).forEach(function (key) {
          var ast = node[key], type;
          if (ast && typeof ast === "object" && key !== "range") {
            type = ast.type ? "Node" : Array.isArray(ast) ? "NodeSet" : "Unknown";
            visit({
              key: key,
              ast: ast,
              type: type
            });
          }
        }.bind(this));
      };
      Tree.prototype.visitByType = function (typeCallbacks) {
        this.children.forEach(function (child) {
          if (!child.ast) {
            return;
          }
          var callback = typeCallbacks[child.ast.type];
          if (callback) {
            callback(child);
          }
          child.visitByType(typeCallbacks);
        }.bind(this));
      };
      Tree.prototype.raw = function () {
        return this.source.substring(this.ast.range[0], this.ast.range[1]);
      };
      Tree.prototype.isRoot = function () {
        return this.parent === this.root;
      };
      Tree.prototype.path = function () {
        return this.isRoot() ? "" : this.parent.path + "." + this.key;
      };
      return Tree;
    }();
  Object.define(Tree, {
    create: function (src, options) {
      return new this(src, options);
    }
  });
  Object.define(Tree.prototype, require("./trav").Traversal);
});