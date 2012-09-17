global.StopIteration = {};

Object.defineProperties(global.Object, {
  define: {
    value: function(target, source) {
      var desc = {};
      Object.keys(source).forEach(function(key) {
        return desc[key] = Object.getOwnPropertyDescriptor(source, key);
      });
      Object.defineProperties(target, desc);
      return target;
    },
    enumerable: false,
    writable: true,
    configurable: true
  }
});

Array.prototype.iterator = function() {
  return {
    elements: this,
    index: 0,
    next: function() {
      if (this.index >= this.elements.length) throw StopIteration;
      return this.elements[this.index++];
    }
  };
};