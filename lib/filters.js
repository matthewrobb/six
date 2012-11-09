if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  var filters = exports.filters = {
      egal: require("./filters/egal").filter,
      "class": require("./filters/class").filter
    };
});