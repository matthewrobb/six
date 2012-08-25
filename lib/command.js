
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var exec = child_process.exec;
var exists = fs.exists || path.exists;

var cmd = require('commander');
var watch = require('watch');

var six = require('./six');

var sources;

exports.run = function() {

  cmd
    .version('0.0.1')
    .option('-c, --compile')
    .option('-o, --output <path>')
    .option('-w, --watch')
    .parse(process.argv);

  sources = cmd.args;

  sources.forEach(function(source){
    compilePath(source, path.normalize(source))
  })

}

function compilePath(source, base) {
  fs.stat(source, function(err, stats){
    if ( stats.isDirectory() ) {
      if( cmd.watch ) watchDir(source, base);
      fs.readdir(source, function(err, files){
        files.forEach(function(file){
          compilePath(path.join(source, file), base)
        })
      })
    } else if ( path.extname(source) === '.js' ) {
      // Watch file if cmd.watch
      fs.readFile(source, function(err, code){
        compileScript(source, code.toString(), base)
      })
    }
  })
}

function compileScript(file, input, base) {
  if ( cmd.compile ) {
    writeJs(file, six.compile(input), base);
  }
}

function watchDir(source, base) {
  watch.createMonitor(source, function(monitor){
    monitor.on("changed", function(file){
      compilePath(file, path.normalize(file));
    });
  });
}

function outputPath(source, base) {
  var filename = path.basename(source, path.extname(source)) + '.js';
  var srcDir = path.dirname(source);
  var baseDir = (base === '.') ? srcDir : srcDir.substring(base.length);
  var dir = (cmd.output) ? path.join(cmd.output, baseDir) : srcDir;
  return path.join(dir, filename);
}

function writeJs(source, js, base) {
  var jsPath = outputPath(source, base);
  var jsDir = path.dirname(jsPath);
  var compile = function(){
    fs.writeFile(jsPath, js, function(err){
      if ( cmd.compile ) {
        timeLog("compiled " + source);
      }
    })
  }
  exists(jsDir, function(itExists){
    if ( itExists ) {
      compile();
    } else {
      exec("mkdir -p " + jsDir, compile);
    }
  })
}

function timeLog(message) {
  console.log((new Date).toLocaleTimeString() + " - " + message)
}



