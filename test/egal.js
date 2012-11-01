var expect = require("chai").expect;
var six = require('../lib/six');
var compile = function (src) { return six.compile(src, { global: true }); }

describe('egal operators', function() {

  it('finds two idential numeric literals to be equal', function() {
    var src = "var a = 1 is 1, b = 1 isnt 1"
    var result = compile(src)
    eval(result)
    a.should.be.true
    b.should.be.false
  });

  it('finds two different numeric literals as not equal', function() {
    var src = "var a = 1 is 2, b = 1 isnt 2"
    var result = compile(src)
    eval(result)
    a.should.be.false
    b.should.be.true
  });

  it('finds literal 0 as not equal to literal -0', function() {
    var src = "var a = 0 is -0, b = 0 isnt -0"
    var result = compile(src)
    eval(result)
    a.should.be.false
    b.should.be.true
  });

  it('finds NaN as equal to NaN', function() {
    var src = "var a = NaN is NaN, b = NaN isnt NaN"
    var result = compile(src)
    eval(result)
    a.should.be.true
    b.should.be.false
  });

});
