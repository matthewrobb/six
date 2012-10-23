var expect = require("chai").expect;
var six = require('../lib/six');
var compile = function (src) { return six.compile(src, { global: true }); }

describe('shorthand properties', function() {

  it('converts shorthand properties into longhand properties', function() {
    var src = "var a = 1; var o = { a, b: 2, c: 3 }"
    var result = compile(src)
    eval(result)
    JSON.stringify(o).should.equal(JSON.stringify({ a: 1, b: 2, c: 3 }))
  });

});
