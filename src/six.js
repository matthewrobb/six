module fs = "fs";

module harmonizr = "./harmonizr";
module esprima = "./esprima";

module dust = "dustjs-linkedin";
module Beautifier = "node-js-beautify";

var parse = esprima.parse
var Syntax = esprima.Syntax;

function compile(src, options) {
  src = processClasses(src, options);
  src = harmonizr.harmonize(src, options);
  return src;
}

dust.compileFn(fs.readFileSync(__dirname + "/templates/Program.tpl").toString(), "Program");
dust.compileFn(fs.readFileSync(__dirname + "/templates/ClassDeclaration.tpl").toString(), "ClassDeclaration");

function processClasses(src, options) {
  var ast = parse(src, { loc: true });
  var lines = src.split('\n');

  /*ast.print = function(a,s,d,p) { return console.dir(p); };

  ast.extract = function(chunk, context, bodies, params) {
    //console.log(params.target);
    //chunk.write(extract(lines, params.target.loc));
  }

  dust.render("Program", ast, function(err, out) {
    var b = new Beautifier();
    console.log(b.beautify_js(out));
  });*/

  return src;
}

function extract(lines, loc) {
  var firstLine = loc.start.line - 1;
  var lastLine = loc.end.line - 1;

  if(firstLine === lastLine){
    return lines[firstLine].substring(loc.start.column, loc.end.column);
  } else {

    var bits = [];

    bits.push(lines[firstLine].substr(loc.start.column));

    for(var x = firstLine+1; x < lastLine; x++ ){
      bits.push(lines[x]);
    }

    bits.push(lines[lastLine].substr(0, loc.end.column));

    return bits.join("\n").trim();
  }    
}

module.exports = {
  harmonize: harmonizr.harmonize,
  moduleStyles: harmonizr.moduleStyles,
  compile: compile
};