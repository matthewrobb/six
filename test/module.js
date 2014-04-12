var expect = require("chai").expect;
var six = require('../lib/six');
var compile = function (src) { return six.compile(src, { global: true }); }

describe('import statement', function() {
  it("imports a module function", function(){
    var src = "import number from './inc/magic'; var n = number()"
    var result = compile(src)
    eval(result)
    expect(n).to.equal(420)
  })

  it("imports a module function using a pattern", function(){
    var src = "import {number} from './inc/magic'; var n = number()"
    var result = compile(src)
    eval(result)
    expect(n).to.equal(420)
  })

  it("import and alias a module function", function(){
    var src = "import {number: num} from './inc/magic'; var n = num()"
    var result = compile(src)
    eval(result)
    expect(n).to.equal(420)
  })

  it("alias a module to an identifier", function(){
    var src = "module mag = './inc/magic'; var n = mag.number()"
    var result = compile(src)
    eval(result)
    expect(n).to.equal(420)
  })

  it("alias a module alias to a subsequent alias", function(){
    var src = "module dance = './inc/magic'; module bon = dance; var n = bon.number()"
    var result = compile(src)
    eval(result)
    expect(n).to.equal(420)
  })

  it("export a function from a module", function(){
    var src = "export function add400(a) { return a + 400; }"
    eval(six.compile(src))
    var n = exports.add400(20)
    expect(n).to.equal(420)
    exports = {}
  })

  it("export a variable from a module", function(){
    var src = "export var n = 420"
    eval(six.compile(src))
    expect(exports.n).to.equal(420)
    exports = {}
  })

  it("export variables from a module", function(){
    var src = "export var a = 420, b = 400, c = 20"
    eval(six.compile(src))
    expect(exports.a).to.equal(exports.b + exports.c)
    exports = {}
  })

  it("export module alias from a module", function(){
    var src = "export module mag = './inc/magic';"
    eval(six.compile(src))
    expect(exports.mag.number()).to.equal(420)
    exports = {}
  })

  it("export a predeclared symbol", function(){
    var src = "var lovely = 'kitten'; export lovely"
    eval(six.compile(src))
    expect(exports.lovely).to.equal('kitten')
    exports = {}
  })

  it("export a class", function(){
    var src = "export class Friend {}"
    eval(six.compile(src))
    expect(exports.Friend).to.not.be.undefined
  })
});
