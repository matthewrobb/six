if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define(function (require, exports) {
  "use strict";
  var Six = require("./six");
  Six.require = require;
  Six.eval = function (code, options) {
    return eval(Six.compile(code, options));
  };
  Six.run = function (code, options) {
    Function(Six.compile(code, options || { global: true }))();
  };
  Six.load = function (url, callback) {
    var xhr = window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    xhr.open("GET", url, true);
    if ("overrideMimeType" in xhr)
      xhr.overrideMimeType("text/plain");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0)
          Six.run(xhr.responseText);
        else
          throw new Error("Could not load " + url);
        callback && callback();
      }
    };
    xhr.send(null);
  };
  var runScripts = function () {
    var scripts = document.getElementsByTagName("script");
    var sixes = [];
    sixes.forEach.call(scripts, function (s) {
      return s.type === "text/six" && sixes.push(s);
    }.bind(this));
    var index = 0;
    var length = sixes.length;
    var execute = function () {
        var script = sixes[index++];
        if (script && script.type === "text/six") {
          if (script.src)
            Six.load(script.src, execute);
          else {
            Six.run(script.innerHTML);
            execute();
          }
        }
      }.bind(this);
    execute();
    return null;
  };
  if (window.addEventListener)
    window.addEventListener("DOMContentLoaded", runScripts, false);
  else
    window.attachEvent("onload", runScripts);
});