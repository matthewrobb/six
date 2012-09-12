Six = require("./six")

Six.require = require

Six.eval = function(code, options) {
  return eval(Six.compile(code, options))
}

Six.run = function(code, options) {
  Function(Six.compile(code, options))()
}

// Load a remote script from the current domain via XHR.
Six.load = function(url, callback) {
  var xhr = window.ActiveXObject
    ? new window.ActiveXObject('Microsoft.XMLHTTP')
    : new XMLHttpRequest()

  xhr.open('GET', url, true)
  if ('overrideMimeType' in xhr) xhr.overrideMimeType('text/plain')
  xhr.onreadystatechange = function() {
    if ( xhr.readyState === 4 ) {
      if ( xhr.status === 200 || xhr.status === 0 ) Six.run(xhr.responseText)
      else throw new Error("Could not load " + url)
      callback && callback()
    }
  }
  xhr.send(null)
}

// Activate Six in the browser by having it compile and evaluate
// all script tags with a content-type of `text/six`.
// This happens on page load.
var runScripts = function() {
  var scripts = document.getElementsByTagName('script')
  var sixes = []
  sixes.forEach.call(scripts, function(s) { return s.type === 'text/six' && sixes.push(s); })

  var index = 0
  var length = sixes.length

  var execute = function() {
    var script = sixes[index++]
    if ( script && script.type === 'text/six'){
      if ( script.src ) Six.load(script.src, execute)
      else {
        Six.run(script.innerHTML)
        execute()
      }
    }
  }

  execute()

  return null
}

// Listen for window load, both in browsers and in IE.
if (window.addEventListener) window.addEventListener('DOMContentLoaded', runScripts, false)
else window.attachEvent('onload', runScripts)