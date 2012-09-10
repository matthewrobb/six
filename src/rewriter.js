var Tree = require("./estree")

function rewrite(src) {
	return Tree.create(src).compile()
}

Object.define(Tree.prototype, {

  compile () {
    var src = this.raw

    this.children.reverse().forEach(child => {
      var raw = child.raw
      var start = src.indexOf(raw)
      var end = start + raw.length
      src = src.substring(0, start) + child.compile() + src.substring(end)
    })

    return src
  }

})

exports.rewrite = rewrite