var expect = require("chai").expect;
var six = require('../lib/six'); // this require enables the .six file extension
var compile = function (src) { return six.compile(src, { global: true }); }

describe('rest parameters', function() {
  it ('function declaration with only rest parameter', function(){
    var src = "function f(...b) { return b[1] }; var c = f(1, 2, 3)"
    eval(compile(src))
    expect(c).to.equal(2)
  })

  it ('function declaration with subsequent rest parameter', function(){
    var src = "function f(a, ...b) { return b[1] }; var c = f(1, 2, 3)"
    eval(compile(src))
    expect(c).to.equal(3)
  })

  it ('export function declaration with subsequent rest parameter', function(){
    var src = "export function f(...b) { return b[1] }"
    eval(compile(src))
    expect(exports.f(1, 2, 3)).to.equal(2)
    exports = {}
  })
})

