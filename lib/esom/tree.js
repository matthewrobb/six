var esprima = require("./esprima"), parse = esprima.parse, Syntax = esprima.Syntax, Tree = function() {
  function Tree(source) {
    var ast = parse(source, {
      loc: true
    });
    Object.define(this, {
      root: this,
      get source() {
        return source;
      },
      get ast() {
        return ast;
      }
    });
    return this.create({
      ast: ast,
      key: "root",
      type: "Node"
    });
  }
  Tree.prototype.create = function(base) {
    var node = Object.create(this.root);
    var parent = this;
    var children = [];
    Object.define(node, base);
    node.climb(function(child) {
      if (child.type === "Node" || child.type === "NodeSet" && child.ast.length) {
        if (child.type === "NodeSet") {
          child.ast.loc = {
            start: child.ast[0].loc.start,
            end: child.ast[child.ast.length - 1].loc.end
          };
        }
        children.push(node.create(child));
      }
    });
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
  Tree.prototype.climb = function(visit) {
    var node = this.ast;
    Object.keys(node).forEach(function(key) {
      var ast = node[key], type;
      if (ast && typeof ast === "object") {
        type = ast.type ? "Node" : Array.isArray(ast) ? "NodeSet" : "Unknown";
        visit({
          key: key,
          ast: ast,
          type: type
        });
      }
    });
  };
  Tree.prototype.loc = function() {
    return this.ast.loc;
  };
  Tree.prototype.lines = function() {
    return this.source.split("\n");
  };
  Tree.prototype.raw = function() {
    return extract(this.lines(), this.loc().start, this.loc().end);
  };
  Tree.prototype.isRoot = function() {
    return this.parent === this.root;
  };
  Tree.prototype.path = function() {
    return this.isRoot() ? "" : this.parent.path + "." + this.key;
  };
  return Tree;
}();

function extract(lines, from, to) {
  var lineno, ret = [];
  if (from.line === to.line) {
    ret.push(lines[from.line - 1].substring(from.column, to.column));
  } else {
    ret.push(lines[from.line - 1].substring(from.column));
    for (lineno = from.line; lineno < to.line - 1; lineno++) ret.push(lines[lineno]);
    ret.push(lines[to.line - 1].substring(0, to.column));
  }
  return ret.join("\n");
}

Object.define(Tree, {
  create: function(src) {
    return new this(src);
  }
});

Object.define(Tree.prototype, require("./trav").Traversal);

exports.Tree = Tree;