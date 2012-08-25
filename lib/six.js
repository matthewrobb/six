var fs = require('fs');

var harmonizr = require('./harmonizr');
var esprima = require('./esprima');

var parse = esprima.parse
var Syntax = esprima.Syntax;

var harmonize = harmonizr.harmonize;
var modulesStyles = harmonizr.harmonize;

function compile(src, options) {
  options = options || { style: 'node' }
  src = harmonize(src, options);
  return src;
}


module.exports = {
  harmonize: harmonize,
  modulesStyles: modulesStyles,
  compile: compile
};
