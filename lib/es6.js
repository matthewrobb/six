Object.defineProperties(global.Object, {

  define: {
    value: function(target, source) {
      var desc = {}
      Object.keys(source).forEach(function(key) { return desc[key] = Object.getOwnPropertyDescriptor(source, key); })
      Object.defineProperties(target, desc)
      return target
    },
    enumerable: false,
    writable: true,
    configurable: true
  },

  is: {
    value: function(x, y) {
      if (x === y) {
        // 0 === -0, but they are not identical
        return x !== 0 || 1 / x === 1 / y;
      }
   
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      // isNaN is broken: it converts its argument to number, so
      // isNaN("foo") => true
      return x !== x && y !== y;
    },
    configurable: true,
    enumerable: false,
    writable: true
  }

})