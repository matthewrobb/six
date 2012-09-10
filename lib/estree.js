var esprima = require("./esprima");

var parse = esprima.parse;
var Syntax = esprima.Syntax;

function Tree (source) {
  var ast = parse(source, { loc: true })

  Object.define(this, {
    root: this,
    get source() { return source },
    get ast() { return ast }
  })

  return this.create({ ast: ast, key: 'root', type: 'Node' })
}

module.exports = Tree

Object.define(Tree, {
  create: function(src) { return new this(src); }
})

Object.define(Tree.prototype, {

  create: function (base) {
    var node = Object.create(this.root)
    var parent = this
    var children = []

    Object.define(node, base)

    node.climb(function(child) {
      
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
  },

  climb: function (visit) {
    var node = this.ast
    Object.keys(node).forEach(function(key) {
      var ast = node[key], type

      if (ast && typeof ast === 'object') {
        type = (ast.type) ? "Node" : Array.isArray(ast) ? "NodeSet" : "Unknown"
        visit({ key: key, ast: ast, type: type })
      }

    })
  },

  get loc () {
    return this.ast.loc
  },

  get lines () {
    return this.source.split('\n')
  },

  get raw () {
    return extract(this.lines, this.loc.start, this.loc.end)
  },

  get isRoot() {
    return this.parent === this.root
  },

  get path () {
    return this.isRoot ? "" : this.parent.path + "." + this.key
  },

  get first () {
    return this.children[ 0 ]
  },

  get next () {
    var siblings = this.parent.children
    return siblings[siblings.indexOf(this) + 1]
  },

  get prev () {
    var siblings = this.parent.children
    return siblings[siblings.indexOf(this) - 1]
  },

  get last () {
    return this.children[ this.children.length -1 ]
  },

  get deepest () {
    var deepest = []

    this.children.forEach(function(child) {
      !child.children.length ? deepest.push(child)
        : child.deepest.forEach( function(child) { return deepest.push(child); })
    })

    return deepest
  }

})

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