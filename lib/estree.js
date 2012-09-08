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

    if(node.key === "root") {
      //console.log(node.lines)
    }

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

  get loco () {
    var start, end

    if (this.type !== "NodeSet") {
      start = this.ast.loc.start
      end = this.ast.loc.end
    } else if (this.ast.length) {
      start = this.ast[0].loc.start
      end = this.ast[this.ast.length -1].loc.end
    }

    return { start: start, end: end }
  },

  get loc () {
    var start = {
      line: (this.ast.loc.start.line - this.parent.ast.loc.start.line) + 1,
      column: this.ast.loc.start.column
    }

    if (this.ast.loc.start.line === this.parent.ast.loc.start.line) {
      start.column -= this.parent.ast.loc.start.column
    }

    var end = {
      line: (this.ast.loc.end.line - this.parent.ast.loc.start.line) + 1,
      column: this.ast.loc.end.column
    }

    if (this.ast.loc.end.line === this.parent.ast.loc.start.line) {
      end.column -= this.parent.ast.loc.start.column
    }

    return { start: start, end: end }
  },

  get lines () {
    return extracttoo(this.root.lines, this.ast.loc.start, this.ast.loc.end)
  },

  get raw () {
    return this.lines.join('\n')
  },

  get lineso () {
    return this.source.split('\n')
  },

  get rawo () {
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
    var parent = this.parent
    var index = parent.children.indexOf(this)
    var next = parent.children[index + 1]
    return next
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

function extracttoo(lines, from, to) {
  var ret = []
  if (from.line === to.line) {
      ret.push(lines[from.line - 1].substring(from.column, to.column))
  } else {
      ret.push(lines[from.line - 1].substring(from.column))
      for (var lineno = from.line; lineno < to.line - 1; lineno++) ret.push(lines[lineno])
      ret.push(lines[to.line - 1].substring(0, to.column))
  }
  return ret
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
