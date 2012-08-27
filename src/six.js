module fs = "fs";

module harmonizr = "./harmonizr";
module esprima = "./esprima";

var parse = esprima.parse;
var Syntax = esprima.Syntax;

export var harmonize = harmonizr.harmonize;
export var modulesStyles = harmonizr.modulesStyles;

export var compile = (src, options) => {
  options = options || { style: 'node' }
  src = harmonize(src, options);
  return src;
}
