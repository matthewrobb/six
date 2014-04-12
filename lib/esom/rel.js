if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var Relatives = exports.Relatives = {
      first: function () {
        return this.children[0];
      },
      last: function () {
        return this.children[this.children.length - 1];
      },
      next: function () {
        var siblings = this.parent.children;
        return siblings[siblings.indexOf(this) + 1];
      },
      prev: function () {
        var siblings = this.parent.children;
        return siblings[siblings.indexOf(this) - 1];
      },
      deepest: function () {
        var deepest = [];
        this.children.forEach(function (child) {
          !child.children.length ? deepest.push(child) : child.deepest.forEach(function (child) {
            return deepest.push(child);
          }.bind(this));
        }.bind(this));
        return deepest;
      }
    };
});