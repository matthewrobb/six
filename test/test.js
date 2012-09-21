var six = require('../lib/six');

describe('six', function() {

  describe('shorthand properties', function() {

    it('converts shorthand properties into longhand properties', function() {
      var src = "var a = 1; var o = { a, b: 2, c: 3 }"
      var result = six.compile(src)
      eval(result)
      JSON.stringify(o).should.equal(JSON.stringify({ a: 1, b: 2, c: 3 }))
    });

  });

  describe('destructuring ObjectPattern Assignment', function() {

    it('destructures into property accessors when the RHS is an Identifier', function() {
      var src = "var a = {b:1}; var {b} = a"
      var result = six.compile(src)
      eval(result)
      b.should.equal(1)
    });

    it('destructures into property accessors when the RHS is an ObjectExpression', function() {
      var src = "var {a} = {a:1}"
      var result = six.compile(src)
      eval(result)
      a.should.equal(1)
    });

    it('destructures into property accessors when the RHS is an ArrayExpression', function() {
      var src = "var {a: length} = [1,2,3]"
      var result = six.compile(src)
      eval(result)
      a.should.equal(3)
    });

    it('destructures into property accessors when the RHS is an FunctionExpression', function() {
      var src = "var {a: length} = function(a,b,c){}"
      var result = six.compile(src)
      eval(result)
      a.should.equal(3)
    });

  });

  describe('egal operators', function() {

    it('finds two idential numeric literals to be equal', function() {
      var src = "var a = 1 is 1, b = 1 isnt 1"
      var result = six.compile(src)
      eval(result)
      a.should.be.true
      b.should.be.false
    });

    it('finds two different numeric literals as not equal', function() {
      var src = "var a = 1 is 2, b = 1 isnt 2"
      var result = six.compile(src)
      eval(result)
      a.should.be.false
      b.should.be.true
    });

    it('finds literal 0 as not equal to literal -0', function() {
      var src = "var a = 0 is -0, b = 0 isnt -0"
      var result = six.compile(src)
      eval(result)
      a.should.be.false
      b.should.be.true
    });

    it('finds NaN as equal to NaN', function() {
      var src = "var a = NaN is NaN, b = NaN isnt NaN"
      var result = six.compile(src)
      eval(result)
      a.should.be.true
      b.should.be.false
    });

  });

  describe('classes', function() {

  });

  describe('iterators', function() {

  });

  describe('quasi-literals', function() {

  });

});