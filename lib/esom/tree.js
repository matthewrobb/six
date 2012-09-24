var esprima = require("esprima-six");
var parse = esprima.parse;
var Syntax = esprima.Syntax;
var Tree = function () {
    function Tree(source) {
      var ast = parse(source, {range: true});
      var children = [];
      Object.define(this, {
        root: this,
        get source() {
          return source;
        },
        get ast() {
          return ast;
        },
        get children() {
          return children;
        }
      });
      children.push(this.create({
        ast: ast,
        key: "root",
        type: "Node"
      }));
      return children[0];
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
      Object.define(node, {
        get ast() {
          return base.ast;
        },
        get parent() {
          return parent;
        },
        get children() {
          return children.slice(0);
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
Object.define(Tree, {create: function (src) {
    return new this(src);
  }});
Object.define(Tree.prototype, require("./trav").Traversal);
exports.Tree = Tree;