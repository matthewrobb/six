var fs = require("fs");

var dot = require("dot")

dot.templateSettings = {
  evaluate:    /\{\{([\s\S]+?)\}\}/g,
  interpolate: /\{\{=([\s\S]+?)\}\}/g,
  encode:      /\{\{!([\s\S]+?)\}\}/g,
  use:         /\{\{#([\s\S]+?)\}\}/g,
  define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
  conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
  iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
  varname: 'it',
  strip: false,
  append: true,
  selfcontained: false
}

var Tree = require("./estree")

function rewrite(src) {
	return Tree.create(src).compile()
}

Object.define(Tree.prototype, {

  compile () {
    var result
    //var tpl = dot.template(this.template)
    //result = tpl(this.context)
    console.log(this.first.lines)
    return result
  },

  get template () {
    var raw = this.raw
    var tpl = raw
    this.children.forEach(child => {
      tpl = tpl.replace(child.raw, '{' + '{' + '=' + 'it["' + child.key + '"].compile()}' + '}')
    })

    return tpl
  },

  get context () {
    return new Context(this)
  }

})

function Context (node) {

  Object.define(this, {
    get node() { return node }
  })

  node.children.forEach(child => {
    Object.defineProperty(this, child.key, {
      enumerable: true,
      get() child.context
    })
  })

  if (node.isRoot) this.root = this

}

Object.define(Context.prototype, {

  compile () this.node.compile()

})

exports.rewrite = rewrite