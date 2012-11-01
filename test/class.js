var expect = require("chai").expect;
var six = require('../lib/six');
var compile = function (src) { return six.compile(src, { global: true }); }

describe('classes', function() {
  it("produces a valid constructor function from an empty declaration", function(){
    var src = "class A {}"
    var result = compile(src)

    eval(result)

    expect(A)
      .to.be.a("function")

    expect(A.name)
      .to.equal("A")

    expect(A)
      .to.have.length(0)

    expect((new A).constructor)
      .to.equal(A)

    expect((new A).constructor.prototype)
      .to.equal(A.prototype)
  })

  it("produces a valid constructor function from an empty constructor method", function(){
    var src = "class A {constructor(b){}}"
    var result = compile(src)

    eval(result)

    expect(A)
      .to.be.a("function")

    expect(A.name)
      .to.equal("A")

    expect(A)
      .to.have.length(1)

    expect((new A).constructor)
      .to.equal(A)

    expect((new A).constructor.prototype)
      .to.equal(A.prototype)
  })

});
