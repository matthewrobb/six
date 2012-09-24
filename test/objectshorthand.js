var expect = require("chai").expect;
var six = require('../lib/six');

describe('shorthand properties', function() {

  it('converts shorthand properties into longhand properties', function() {
    var src = "var a = 1; var o = { a, b: 2, c: 3 }"
    var result = six.compile(src)
    eval(result)
    JSON.stringify(o).should.equal(JSON.stringify({ a: 1, b: 2, c: 3 }))
  });

});