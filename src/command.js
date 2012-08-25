import { exec } from 'child_process';

module fs = 'fs';
module path = 'path';

module cmd = 'commander';
module watch = 'watch';

module six = './six';

var exists = fs.exists || path.exists;

var sources;

export function run() {

  cmd
    .version('0.0.1')
    .option('-c, --compile')
    .option('-o, --output <path>')
    .option('-w, --watch')
    .parse(process.argv);

  sources = cmd.args;

  sources.forEach(source => {
    compilePath(source, path.normalize(source))
  })

}

function compilePath(source, base) {
  fs.stat(source, (err, stats) => {
    if ( stats.isDirectory() ) {
      if( cmd.watch ) watchDir(source, base);
      fs.readdir(source, (err, files) => {
        files.forEach(file => {
          compilePath(path.join(source, file), base)
        })
      })
    } else if ( path.extname(source) === '.js' ) {
      if ( cmd.watch ) watchFile(source, base);
      fs.readFile(source, (err, code) => {
        compileScript(source, code.toString(), base)
      })
    }
  })
}

function compileScript(file, input, base) {
  if ( cmd.compile ) {
    var module = path.basename(file).replace(path.extname(file), '');
    writeJs(file, six.compile(input, { module, style: 'node' }), base);
  }
}

function watchDir(source, base) {
  watch.walk(source, (err, files) => {
    Object.keys(files).forEach(file => {
      if ( path.extname(file) === '.js' ) {
        watchFile(file, source);
      }
    });
  });
}

function watchFile(source, base) {
  var prevStats = null;
  var compileTimeout = null;
  var compile = () => {
    clearTimeout(compileTimeout);
    compileTimeout = wait(25, () => {
      fs.stat(source, (err, stats) => {
        if (
          prevStats &&
          stats.size === prevStats.size &&
          stats.mtime.getTime() === prevStats.mtime.getTime() ) return rewatch();

        prevStats = stats;

        fs.readFile(source, (err, code) => {
          compileScript(source, code.toString(), base);
          rewatch();
        });

      });
    });
  }
  var watcher = fs.watch(source, compile);
  var rewatch = () => {
    if ( watcher ) watcher.close();
    watcher = fs.watch(source, compile);
  }
}

function wait(ms, func) {
  return setTimeout(func, ms);
}

function outputPath(source, base) {
  var filename = path.basename(source, path.extname(source)) + '.js';
  var srcDir = path.dirname(source);
  var baseDir = base === '.' ? srcDir : srcDir.substring(base.length);
  var dir = cmd.output ? path.join(cmd.output, baseDir) : srcDir;
  return path.join(dir, filename);
}

function writeJs(source, js, base) {
  var jsPath = outputPath(source, base);
  var jsDir = path.dirname(jsPath);
  var compile = () => {
    fs.writeFile(jsPath, js, err => {
      if ( cmd.compile ) timeLog('compiled ' + source)
    })
  }
  exists(jsDir, itExists => {
    if ( itExists ) compile();
    else exec('mkdir -p ' + jsDir, compile);
  })
}

function timeLog(message) {
  console.log((new Date).toLocaleTimeString() + ' - ' + message)
}




