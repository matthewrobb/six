var Tree = require("./esom/tree").Tree

var filters = require("./filters").filters

function rewrite(src) {
  var program = Tree.create(src)

  program
    .select(".BinaryExpression[operator^='is']")
    .forEach(function(node) { return node.compile = function() { return filters.egal(node); }; })

  program
    .select(".QuasiLiteral")
    .forEach(function(node) { return node.compile = function() { return filters.quasi(node); }; })

	return program.compile()
}

Object.define(Tree.prototype, {

  compile: function () {
    var src = this.raw()

    this.children.reverse().forEach(function(child) {
      var raw = child.raw()
      var start = src.indexOf(raw)
      var end = start + raw.length

      src = src.substring(0, start) + child.compile() + src.substring(end)
    })

    return src
  }

})

exports.rewrite = rewrite