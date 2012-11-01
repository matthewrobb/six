var expect = require("chai").expect;
var six = require('../lib/six');
var compile = function (src) { return six.compile(src, { global: true }); }

describe('destructuring ObjectPattern Assignment', function() {

  it('destructures into property accessors when the RHS is an Identifier', function() {
    var src = "var a = {b:1}; var {b} = a"
    var result = compile(src)
    eval(result)
    b.should.equal(1)
  });

  it('destructures into property accessors when the RHS is an ObjectExpression', function() {
    var src = "var {a} = {a:1}"
    var result = compile(src)
    eval(result)
    a.should.equal(1)
  });

  it('destructures into property accessors when the RHS is an ArrayExpression', function() {
    var src = "var {a: length} = [1,2,3]"
    var result = compile(src)
    eval(result)
    a.should.equal(3)
  });

  it('destructures into property accessors when the RHS is an FunctionExpression', function() {
    var src = "var {a: length} = function(a,b,c){}"
    var result = compile(src)
    eval(result)
    a.should.equal(3)
  });

  // var {x} = func()
  // var {x,y} = func()
  // var {x} = y = func()
  // var {x} = y = z
  // var x = {y} = z
  // var x = {a,b} = z
  // var z = {x:1, y:2}; var {x} = {y} = z

});
