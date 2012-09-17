
var Tree = require("./esom/tree").Tree

var filters = require("./filters").filters

function rewrite(src) {
  var program = Tree.create(src)

  program
    .select(".BinaryExpression[operator^='is']")
    .forEach(node => node.compile = () => filters.egal(node))

  program
    .select(".QuasiLiteral")
    .forEach(node => node.compile = () => filters.quasi(node.context()))

  function ClassRewrite(node) {
    var ctx = node.context()
    var constructor
    var methods = []

    if ( ctx.body && ctx.body.body ) {
      ctx.body.body.node.children.forEach(child => {
        var sub = child.context()
        if ( sub.key.node.matches(".Identifier[name='constructor']") ) constructor = sub
        else methods.push(sub)
      })
    }

    Object.define(ctx, {
      get constructor() { return constructor },
      get methods() { return methods }
    })

    return filters.class(ctx)
  }

  program.select(".ClassDeclaration").forEach(node => node.compile = () => ClassRewrite(node))
  program.select(".ClassExpression").forEach(node => node.compile = () => ClassRewrite(node))

  program.select(".CallExpression > .MemberExpression > .Identifier[name='super']").forEach(node => {
    var Call = node.closest(".CallExpression").context()
    var callee = Call.callee
    var args = Call.arguments

    if (args && args.compile){
      var argsc = args = args.compile()
    }

    node.compile = () => "this.constructor.__super__"
    callee.property.node.compile = () => callee.property.name + ".call"
    if (args && args.node) args.node.compile = () => `this${ args.node ? "," + argsc : "" }`
  })

  program.select(".CallExpression > callee[name='super']").forEach(node => {
    var Call = node.parent.context()
    var args = Call.arguments
    if(args && args.compile){
      args = args.compile()
    }
    
    Call.node.compile = () => `this.constructor.__super__.constructor.call(this ${ args.node ? "," + args:"" })`

  })

  program.select(".ForOfStatement").forEach(node => {
    node.compile = () => {
      var context = node.context()
      var dec = context.left.matches(".VariableDeclaration[kind='var']")
      var left = dec ? context.left.declarations.compile() : context.left.compile()
      var right = context.right.compile()
      var body = context.body.compile()

      return `
        ${ dec ? context.left.compile() + ";" : "" }
        void function(_iterator){
          try {
            while (${ left } = _iterator.next()) ${ body }
          } catch (e) { if (e !== StopIteration ) throw e }
        }.call(this, ${ right }.iterator());
      `
    }
  })

	return program.compile()
}

Object.define(Tree.prototype, {

  compile () {
    var src = this.raw()

    this.children.reverse().forEach(child => {
      var raw = child.raw()
      var start = src.indexOf(raw)
      var end = start + raw.length

      src = src.substring(0, start) + child.compile() + src.substring(end)
    })

    return src
  },

  context() {
    var ctx = new Context(this)
    return ctx
  }

})

class Context {

  constructor(node) {
    var stack = Object.create(node)

    Object.define(stack, node.ast)
    Object.define(stack, {
      node,
      get parent() {
        if ( node.parent ) return node.parent.context()
      }
    })

    if (stack.hasOwnProperty("loc")) delete stack['loc']

    node.children.forEach(child => {
      var ctx = child.context()
      Object.defineProperty(stack, child.key, {
        get() ctx,
        enumerable: true
      })
    })

    return stack
  }

}

exports.rewrite = rewrite