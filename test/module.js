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
});
