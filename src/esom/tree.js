var esprima = require("esprima-six");

var parse = esprima.parse;
var Syntax = esprima.Syntax;

class Tree {

  constructor(source) {
    var ast = parse(source, { range: true, })

    Object.define(this, {
      root: this,
      get source() { return source },
      get ast() { return ast }
    })

    return this.create({ ast, key: 'root', type: 'Node' })
  }

  create (base) {
    var node = Object.create(this.root)
    var parent = this
    var children = []

    Object.define(node, base)

    node.climb(child => {
      
      if (child.type === 'Node' || (child.type === "NodeSet" && child.ast.length)) {
        if (child.type === "NodeSet") {
          child.ast.range = [child.ast[0].range[0], child.ast[child.ast.length - 1].range[1]]
        }
        children.push(node.create(child))
      }
    })

    Object.define(node, {
      get ast() { return base.ast },
      get parent() { return parent },
      get children() { return children.slice(0) }
    })

    return node
  }

  climb (visit) {
    var node = this.ast
    Object.keys(node).forEach(key => {
      var ast = node[key], type

      if (ast && typeof ast === 'object' && key !== "range") {
        type = (ast.type) ? "Node" : Array.isArray(ast) ? "NodeSet" : "Unknown"
        visit({ key, ast, type })
      }

    })
  }

  raw() { return this.source.substring(this.ast.range[0], this.ast.range[1]) }
  isRoot() { return this.parent === this.root }
  path() { return this.isRoot() ? "" : this.parent.path + "." + this.key }

}

Object.define(Tree, {
  create(src) new this(src)
})

Object.define(Tree.prototype, require("./trav").Traversal)

exports.Tree = Tree