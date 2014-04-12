if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var x = {
      foo: "bar",
      what: "upBRO"
    };
  var object = x, foo = object.foo;
  var list = [
      1,
      2,
      3
    ];
  console.log(list.map(function (i) {
    return i * i;
  }.bind(this)));
});