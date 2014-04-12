var path    = require("path"),
    sweet   = require("sweet.js"),
    modules = [
        requireMacro("fat-arrow-fn"),
        requireMacro("var-destructuring"),
        requireMacro("for-of")
    ];

function requireMacro(name) {
    return sweet.loadNodeModule(path.dirname(module.filename), "../macros/" + name + ".sjs");
}

function compile (src, options, callback) {
    return sweet.compile(src, {
        filename      : options.filename,
        readableNames : true,
        modules       : modules
    }).code;
}

exports.compile = compile;