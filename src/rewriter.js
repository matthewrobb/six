
var Tree = require("./esom/tree").Tree

var filters = require("./filters").filters

function rewrite(src) {
  var program = Tree.create(src)

  program
    .select(".VariableDeclarator > id.ObjectPattern")
    .forEach(node => {

      node.properties = () => {
        var ctx = node.parent.context()
        var props = []

        ctx.id.properties.node.children.forEach(child => {
          var prop = child.context()
          var key = prop.key.compile()
          var value = prop.value.compile()
          props.push({ key, value })
        })

        return props
      }

      node.assemble = (init) => {
        var ctx = node.parent.context()
        var props = node.properties()
        var result = ""

        if (!ctx.init || !ctx.init.matches(".Identifier")) {
          var first = props.shift()
          result += `${first.key} = ${init}, `
          props.push(first)
          init = first.key
        }

        props = props.map((prop, index) => `${prop.key} = ${init}.${prop.value}`)

        return `${result}${props.join(", ")}`
      }

      node.parent.compile = () => node.assemble(node.parent.context().init.compile())
    })

  program
    .select(".ObjectExpression > properties > .Property[shorthand=true]")
    .forEach(node => {
      node.compile = () => {
        var key = node.context().key.compile()
        return `${key}:${key}`
      }
    })

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

    if ( ctx.body && ctx.body.body && ctx.body.body.node ) {
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
      var right = context.right.compile()
      var body = context.body.compile().replace(/^{([\s\S]*)}$/, "$1")
      var dec = context.left.matches(".VariableDeclaration[kind='var']")
      var decs = []
      var left = dec ? context.left.declarations.node.first().context() : context.left.node.context()

      if (left.type === "Identifier" || (left.id && left.id.type === "Identifier")) {
        decs.push(left.compile())
        left = `${left.compile()} = _iterator.next()`
      } else if (left.type === "VariableDeclarator" && left.id.type === "ObjectPattern") {
        left.select(".ObjectPattern").forEach(node => {
          decs = decs.concat(node.properties().map(prop=>prop.key))
          left = node.assemble("_iterator.next()")
        })
      } else {
        left = `(${left.compile()})`
      }

      return `
        ${ dec ? "var " + decs.join(", ") + ";" : "" }
        void function(_iterator){
          try {
            while (true) {
              ${ left }
              ${ body }
            }
          } catch (e) { if (e !== StopIteration ) throw e }
        }.call(this, ${ right }.iterator());
      `
    }
  })

  var fin = program.compile()

  var escodegen = require("escodegen")

  fin = escodegen.generate(Tree.create(fin).ast, {
    format: {
      indent: {
        style: '  ',
        base: 0
      },
      quotes: "double",
      compact: true
    },
    comment: true
  })

	return fin
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