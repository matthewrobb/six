if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var fs = require("fs");
  var path = require("path");
  var helpers = require("./helpers");
  var optparse = require("./optparse");
  var Six = require("./six");
  var existsSync = fs.existsSync || path.existsSync;
  var tasks = {};
  var options = {};
  var switches = [];
  var oparse = null;
  helpers.extend(global, {
    task: function (name, description, action) {
      var _ref;
      if (!action) {
        _ref = [
          description,
          action
        ], action = _ref[0], description = _ref[1];
      }
      return tasks[name] = {
        name: name,
        description: description,
        action: action
      };
    },
    option: function (letter, flag, description) {
      return switches.push([
        letter,
        flag,
        description
      ]);
    },
    invoke: function (name) {
      if (!tasks[name])
        missingTask(name);
      return tasks[name].action(options);
    }
  });
  var run = exports.run = function () {
      global.__originalDirname = fs.realpathSync(".");
      process.chdir(sakefileDirectory(__originalDirname));
      var args = process.argv.slice(2);
      Six.run(fs.readFileSync("Sakefile").toString(), { filename: "Sakefile" });
      oparse = new optparse.OptionParser(switches);
      if (!args.length)
        return printTasks();
      try {
        var options = oparse.parse(args);
      } catch (e) {
        return fatalError(e + "");
      }
      options.arguments.forEach(function (arg) {
        invoke(arg);
      });
    };
  var printTasks = function () {
    var relative = path.relative || path.resolve;
    var sakefilePath = path.join(relative(__originalDirname, process.cwd()), "Sakefile");
    console.log(sakefilePath + " defines the following tasks:\n");
    Object.keys(tasks).forEach(function (name) {
      var task = tasks[name];
      var spaces = 20 - name.length;
      spaces = spaces > 0 ? Array(spaces + 1).join(" ") : "";
      var desc = task.description ? "# " + task.description : "";
      console.log("sake " + name + spaces + " " + desc);
    });
    if (switches.length)
      console.log(oparse.help());
  };
  var fatalError = function (message) {
    console.error(message + "\n");
    console.log("To see a list of all tasks/options, run \"sake\"");
    process.exit(1);
  };
  var missingTask = function (task) {
    fatalError("No such task: " + task);
  };
  var sakefileDirectory = function (dir) {
    if (existsSync(path.join(dir, "Sakefile")))
      return dir;
    var parent = path.normalize(path.join(dir), "..");
    if (parent !== dir)
      return sakefileDirectory(parent);
    throw new Error("Sakefile not found in " + process.cwd());
  };
});