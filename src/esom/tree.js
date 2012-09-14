var esprima = require("./esprima");

var parse = esprima.parse;
var Syntax = esprima.Syntax;

class Tree {

  constructor(source) {
    var ast = parse(source, { loc: true })

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
          child.ast.loc = {
            start: child.ast[0].loc.start,
            end: child.ast[child.ast.length - 1].loc.end
          }
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

      if (ast && typeof ast === 'object') {
        type = (ast.type) ? "Node" : Array.isArray(ast) ? "NodeSet" : "Unknown"
        visit({ key, ast, type })
      }

    })
  }

  loc() { return this.ast.loc }
  lines() { return this.source.split('\n') }
  raw() { return extract(this.lines(), this.loc().start, this.loc().end) }
  isRoot() { return this.parent === this.root }
  path() { return this.isRoot() ? "" : this.parent.path + "." + this.key }

}

function extract(lines, from, to) {
  var ret = []
  if (from.line === to.line) {
      ret.push(lines[from.line - 1].substring(from.column, to.column))
  } else {
      ret.push(lines[from.line - 1].substring(from.column))
      for (var lineno = from.line; lineno < to.line - 1; lineno++) ret.push(lines[lineno])
      ret.push(lines[to.line - 1].substring(0, to.column))
  }
  return ret.join('\n')
}

Object.define(Tree, {
  create(src) new this(src)
})

Object.define(Tree.prototype, require("./trav").Traversal)

exports.Tree = Tree