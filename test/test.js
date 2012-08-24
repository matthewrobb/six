var six = require('../lib/six');

describe('six', function() {

  describe('modules, imports, and exports', function() {

    it('turns module declarations into AMD modules', function() {
      var src      = 'module m {}';
      var expected = 'define(function() {});';
      compile(src, expected, { style: 'amd' });
    });

    it('works when the module is not empty', function() {
      var src      = 'module m { function a() {} }';
      var expected = 'define(function() { function a() {} });';
      compile(src, expected, { style: 'amd' });
    });

    it('works when the module is split across multiple lines', function() {
      var src      = 'module m {\n' +
               '    function a() {}\n' +
               '}';
      var expected = 'define(function() {\n' +
               '    function a() {}\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('does not work with nested modules', function() {
      var src      = 'module m {\n' +
               '    module a {}\n' +
               '}';
      var expected = 'define(function() {\n' +
               '    module a {}\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('converts import declarations into AMD dependencies', function() {
      var src      = 'module m1 {\n' +
               '    import a from m2;\n' +
               '}';
      var expected = 'define([\'m2\'], function(m2) {\n' +
               '    var a = m2.a;\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('supports destructuring imports', function() {
      var src      = 'module m1 {\n' +
               '    import { a, b } from m2;\n' +
               '}';
      var expected = 'define([\'m2\'], function(m2) {\n' +
               '    var a = m2.a, b = m2.b;\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('supports renaming multiple imports', function() {
      var src      = 'module m1 {\n' +
               '    import { a, b: c.d } from m2;\n' +
               '}';
      var expected = 'define([\'m2\'], function(m2) {\n' +
               '    var a = m2.a, b = m2.c.d;\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('skips import * declarations', function() {
      var src      = 'module m1 {\n' +
               '    import * from m2;\n' +
               '}';
      var expected = 'define(function() {\n' +
               '    import * from m2;\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('returns an object containing all the exports', function() {
      var src      = 'module m {\n' +
               '    export var a;\n' +
               '    export function b() {}\n' +
               '}';
      var expected = 'define(function() {\n' +
               '    var a;\n' +
               '    function b() {}\n' +
               '\n' +
               '    return {\n' +
               '        a: a,\n' +
               '        b: b\n' +
               '    };\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('can transpile to Node.js', function() {
      var src      = 'module m1 {\n' +
               '    import { a, b: c.d } from m2;\n' +
               '    export var e;\n' +
               '    export function f() {}\n' +
               '}';
      var expected = '\n' +
               '    var m2 = require(\'m2\'), a = m2.a, b = m2.c.d;\n' +
               '    var e;\n' +
               '    function f() {}\n' +
               '\n' +
               '    module.exports = {\n' +
               '        e: e,\n' +
               '        f: f\n' +
               '    };\n';
      compile(src, expected, { style: 'node' });
    });

    it('allows you to specify which modules are relative', function() {
      var src      = 'module m1 {\n' +
               '    import a from m2;\n' +
               '}';
      var expected = '\n' +
               '    var m2 = require(\'./m2\'), a = m2.a;\n' +
               '';
      compile(src, expected, { style: 'node', relatives: ['m2'] });
    });

    it('can transpile to the revealing module pattern', function() {
      var src      = 'module m1 {\n' +
               '    import a from m2;\n' +
               '    import { b, c: d } from m3;\n' +
               '    export var e;\n' +
               '    export function f() {}\n' +
               '}';
      var expected = 'var m1 = function() {\n' +
               '    var a = m2.a;\n' +
               '    var b = m3.b, c = m3.d;\n' +
               '    var e;\n' +
               '    function f() {}\n' +
               '\n' +
               '    return {\n' +
               '        e: e,\n' +
               '        f: f\n' +
               '    };\n' +
               '}();';
      compile(src, expected, { style: 'revealing' });
    });

    it('can detect indentation when the first line in a module is blank', function() {
      var src      = 'module m1 {\n' +
               '\n' +
               '    import a from m2;\n' +
               '    import { b, c: d } from m3;\n' +
               '    export var e;\n' +
               '    export function f() {}\n' +
               '}';
      var expected = 'var m1 = function() {\n' +
               '\n' +
               '    var a = m2.a;\n' +
               '    var b = m3.b, c = m3.d;\n' +
               '    var e;\n' +
               '    function f() {}\n' +
               '\n' +
               '    return {\n' +
               '        e: e,\n' +
               '        f: f\n' +
               '    };\n' +
               '}();';
      compile(src, expected, { style: 'revealing' });
    });

    it('supports implicit AMD-style modules', function() {
      var src      = 'export function f() {\n' +
               '    return 42;\n' +
               '}';
      var expected = 'define(function() {function f() {\n' +
               '    return 42;\n' +
               '}\n' +
               '\n' +
               'return {\n' +
               '    f: f\n' +
               '};\n' +
               '});';
      compile(src, expected, { style: 'amd', module: 'm' });
    });

    it('supports implicit Node.js-style modules', function() {
      var src      = 'export function f() {\n' +
               '    return 42;\n' +
               '}';
      var expected = 'function f() {\n' +
               '    return 42;\n' +
               '}\n' +
               '\n' +
               'module.exports = {\n' +
               '    f: f\n' +
               '};\n';
      compile(src, expected, { style: 'node', module: 'm' });
    });

    it('supports implicit Revealing Module-style modules', function() {
      var src      = 'export function f() {\n' +
               '    return 42;\n' +
               '}';
      var expected = 'var m = function() {function f() {\n' +
               '    return 42;\n' +
               '}\n' +
               '\n' +
               'return {\n' +
               '    f: f\n' +
               '};\n' +
               '}();';
      compile(src, expected, { style: 'revealing', module: 'm' });
    });

    it('allows whole module imports using module x = y with amd', function() {
      var src      = 'module m1 {\n' +
               '    module m2 = m3;\n' +
               '}';
      var expected = 'define([\'m3\'], function(m3) {\n' +
               '    var m2 = m3;\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

    it('allows whole module imports using module x = y with node', function() {
      var src      = 'module m1 {\n' +
               '    module m2 = m3;\n' +
               '}';
      var expected = '\n' +
               '    var m2 = require(\'m3\');\n' +
               '';
      compile(src, expected, { style: 'node' });
    });

    it('allows whole module imports using module x = y with revealing modules', function() {
      var src      = 'module m1 {\n' +
               '    module m2 = m3;\n' +
               '}';
      var expected = 'var m1 = function() {\n' +
               '    var m2 = m3;\n' +
               '}();';
      compile(src, expected, { style: 'revealing' });
    });

    it('allows specifying modules as strings', function() {
      var src      = 'module m1 {\n' +
               '    module a = \'m2\';\n' +
               '    import b from \'m3\';\n' +
               '}';
      var expected = 'define([\'m2\', \'m3\'], function(m2, m3) {\n' +
               '    var a = m2;\n' +
               '    var b = m3.b;\n' +
               '});';
      compile(src, expected, { style: 'amd' });
    });

  });

  describe('shorthand properties', function() {

    it('converts shorthand properties into longhand properties', function() {
      var src      = 'var o = {\n' +
               '    a,\n' +
               '    b: c,\n' +
               '    d\n' +
               '};';
      var expected = 'var o = {\n' +
               '    a: a,\n' +
               '    b: c,\n' +
               '    d: d\n' +
               '};';
      compile(src, expected);
    });

    it('works when the shorthand properties are on the same line', function() {
      var src      = 'var o = { a, b: c, d };';
      var expected = 'var o = { a: a, b: c, d: d };';
      compile(src, expected);
    });

  });

  describe('method definitions', function() {

    it('supports method definitions', function() {
      var src      = 'var o = {\n' +
               '    m() {}\n' +
               '};';
      var expected = 'var o = {\n' +
               '    m: function() {}\n' +
               '};';
      compile(src, expected);
    });

    it('supports concise methods', function() {
      var src      = 'var o = {\n' +
               '    a() 42\n' +
               '};';
      var expected = 'var o = {\n' +
               '    a: function() { return 42; }\n' +
               '};';
      compile(src, expected);
    });

    it('does not put return in front of concise assignments (or should it?)', function() {
      var src      = 'var o = {\n' +
               '    a(b) c = b\n' +
               '};';
      var expected = 'var o = {\n' +
               '    a: function(b) { c = b; }\n' +
               '};';
      compile(src, expected);
    });

  });

  describe('arrow functions', function() {

    it('supports arrow functions', function() {
      var src      = 'var f = a => 42;';
      var expected = 'var f = function(a) { return 42; };';
      compile(src, expected);
    });

    it('supports arrow functions with no params', function() {
      var src      = 'var f = () => 42;';
      var expected = 'var f = function() { return 42; };';
      compile(src, expected);
    });

    it('supports arrow functions with multiple params', function() {
      var src      = 'var f = (a, b) => 42;';
      var expected = 'var f = function(a, b) { return 42; };';
      compile(src, expected);
    });

    it('supports arrow functions with one wrapped param', function() {
      var src      = 'var f = (a) => 42;';
      var expected = 'var f = function(a) { return 42; };';
      compile(src, expected);
    });

    it('allows curlies around the function body', function() {
      var src      = 'var f = a => { return 42; };';
      var expected = 'var f = function(a) { return 42; };';
      compile(src, expected);
    });

    it('works across lines', function() {
      var src      = 'var f = (\na\n)\n=>\n42;';
      var expected = 'var f = function(\na\n\n\n) { return 42; };';
      compile(src, expected);
    });

    it('binds to the lexical this if it needs to', function() {
      var src      = 'var f = a => this.b;';
      var expected = 'var f = function(a) { return this.b; }.bind(this);';
      compile(src, expected);
    });

    it('allows nested arrow functions', function() {
      var src      = 'var f = a => b => 42;';
      var expected = 'var f = function(a) { return function(b) { return 42; }; };';
      compile(src, expected);
    });

  });

  describe('destructuring assignments', function() {

    it('works with arrays', function() {
      var src      = '[a, b] = [c, d];';
      var expected = 'a = [c, d], b = a[1], a = a[0];';
      compile(src, expected);
    });

  });

});

function compile(src, expected, options) {
  var actual;
  try {
    actual = six.compile(src, options);
  } catch (e) {
    actual = e;
  }
  if (typeof expected === 'string') {
    if (actual instanceof Error) {
      throw actual;
    }
    actual.should.equal(expected);
  } else {
    actual.should.be.an.instanceOf(Error);
    actual.message.should.equal(expected.message);
  }
}