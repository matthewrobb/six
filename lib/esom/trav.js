if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var queryPat = /((?:[\>|\+][\s]*)?(?=[\w|\.])(?:[A-Za-z]+)?(?:\.[A-Za-z]+)?(?:\[[\w]+(?:(?:[*|^|$]?=?(?!\]))(?:[0-9]+(?=\]))?(?:['"][\w]+['"](?=\]))?(?:true|false(?=\]))?)?\])*(?:\:(?!$)(?:[\w]+)(?:\((?:[\s\S]+)\))?)*)/g;
  var queryMatch = /^(?:([\>|\+])[\s]*)?(?=[\w|\.])([A-Za-z]+)?(?:\.([A-Za-z]+))?((?:\[[\w]+(?:(?:[*|^|$]?=?(?!\]))(?:[0-9]+(?=\]))?(?:['"][\w]+['"](?=\]))?(?:true|false(?=\]))?)?\])*)((?:\:(?!$)(?:[\w]+)(?:\((?:[\s\S]+)\))?)*)$/;
  var attrPat = /^([\w]+)(?:(?:([*|^|$]?=)?(?!\]))(?:([0-9]+)(?=\]))?(?:['"]([\w]+)['"](?=\]))?(?:(true|false)(?=\]))?)?\]$/;
  function parse(selector) {
    return new Query(queryMatch.exec(selector));
  }
  var Query = function () {
      function Query(dir) {
        this.dir = dir;
        this.ret = {};
        this.relative();
        this.key();
        this.type();
        this.properties();
        this.pseudos();
        return this.ret;
      }
      Query.prototype.relative = function () {
        switch (this.dir[1]) {
        case ">":
          this.ret.child = true;
          break;
        case "+":
          this.ret.sibling = true;
          break;
        }
      };
      Query.prototype.key = function () {
        if (this.dir[2])
          this.ret.key = this.dir[2];
      };
      Query.prototype.type = function () {
        if (this.dir[3])
          this.ret.type = this.dir[3];
      };
      Query.prototype.properties = function () {
        if (this.dir[4]) {
          this.ret.properties = [];
          this.dir[4].split("[").forEach(function (prop) {
            if (prop)
              this.property(prop);
          }.bind(this));
        }
      };
      Query.prototype.property = function (prop) {
        var parts = attrPat.exec(prop);
        var obj = {};
        if (parts && parts[1]) {
          obj.property = parts[1];
          if (parts[2]) {
            obj.operation = parts[2];
            if (parts[3])
              obj.value = Number(parts[3]);
            else if (parts[4])
              obj.value = parts[4];
            else if (parts[5])
              obj.value = Boolean(parts[5]);
          }
          this.ret.properties.push(obj);
        }
      };
      Query.prototype.pseudos = function () {
        var pat = /(?:\:([\w]+)(?:\(([\s\S]+)\))?)/g;
        var pat2 = /(?:\:([\w]+)(?:\(([\s\S]+)\))?)/;
        if (this.dir[5]) {
          this.ret.pseudos = [];
          this.dir[5].match(pat).forEach(function (seg) {
            var parts = pat2.exec(seg);
            var obj = {};
            if (parts && parts[1]) {
              obj.pseudo = parts[1];
              if (parts[2])
                obj.argument = parts[2];
              this.ret.pseudos.push(obj);
            }
          }.bind(this));
        }
      };
      return Query;
    }();
  var Traversal = exports.Traversal = {
      select: function (query, frags) {
        var results = [];
        var sels = query.match(queryPat);
        var sel = sels.pop();
        var dir = parse(sel);
        frags = frags || sels;
        this.children.forEach(function (child) {
          if (dir.child && child.matches(dir)) {
            var pass = true;
            var cur = child;
            frags.reverse().forEach(function (frag) {
              var dir = parse(frag);
              if (pass & dir.child) {
                if (cur.parent.matches(dir)) {
                  cur = cur.parent;
                } else {
                  pass = false;
                }
              }
            }.bind(this));
            if (pass)
              results.push(child);
          } else if (child.matches(sel)) {
            results.push(child);
          }
          child.select(sel, frags).forEach(function (child) {
            return results.push(child);
          }.bind(this));
        }.bind(this));
        void function enhance(sel) {
          if (sels.length) {
            sel = sels.pop();
            results = results.filter(function (node) {
              return node.closest(sel) ? true : false;
            }.bind(this));
            enhance();
          }
        }();
        return results;
      },
      closest: function (selector) {
        var dir = parse(selector);
        var closest;
        if (this.parent && this.parent !== this.root) {
          closest = this.parent.matches(selector) ? this.parent : this.parent.closest(selector);
        }
        return closest;
      },
      matches: function (dir) {
        var match = true;
        if (typeof dir === "string")
          return this.matches(parse(dir));
        if (match && dir.key && this.key !== dir.key)
          match = false;
        if (match && dir.type && this.ast.type !== dir.type)
          match = false;
        if (dir.properties)
          dir.properties.forEach(function (prop) {
            if (match && prop.property && typeof this.ast[prop.property] === "undefined")
              match = false;
            if (match && prop.property && prop.operation && typeof prop.value !== "undefined") {
              if (prop.operation === "=" && this.ast[prop.property] !== prop.value)
                match = false;
              else if (typeof this.ast[prop.property] === "string") {
                switch (prop.operation) {
                case "^=":
                  if (!this.ast[prop.property].match("^" + prop.value))
                    match = false;
                  break;
                case "$=":
                  if (!this.ast[prop.property].match(prop.value + "$"))
                    match = false;
                  break;
                case "*=":
                  if (!~this.ast[prop.property].indexOf(prop.value))
                    match = false;
                  break;
                }
              }
            }
          }.bind(this));
        return match;
      }
    };
  Object.define(Traversal, require("./rel").Relatives);
});