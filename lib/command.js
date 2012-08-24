var program = require("commander");
var fs = require("fs");
var six = require("./six");

module.exports.run = function() {

  program
    .version("0.0.1")
    .usage('[options] <file...>')
    .option('-c, --compile')
    .option('-b, --blah')
    .parse(process.argv);

  console.log(program.file);

}

function harmonize(path) {
    fs.readFile(path, 'utf8', function(err, src) {
        if (err) {
            process.stderr.write(err.message);
        } else {
            program.style = program.amd       ? 'amd'       :
                            program.node      ? 'node'      :
                            program.revealing ? 'revealing' :
                            program.style;

            var options = {
                style: program.style || 'node',
                module: program.module,
                relatives: program.relatives
            };

            src = six.compile(src, options);

            if (program.output) {
                fs.writeFileSync(program.output, src);
            } else {
                process.stdout.write(src);
            }
        }
    });
}

function list(val) {
    return val.split(',');
}