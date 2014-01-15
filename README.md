six  &nbsp;*:::* &nbsp; JavaScript you can bet on.
===
> Seriously, the shortest path on the Web usually is the winning play.
> JS is demonstrably able to grow new capabilities with less effort than a “replacement” entails.
> Always bet on JS!
> &mdash; <cite>[Brendan Eich][1]</cite>

[1]:https://brendaneich.com/2011/09/capitoljs-rivertrail/

##Elevator
Six is a language super-set of JavaScript that enables new syntactic features from the 6th edition of ECMAScript to be used, through a transpiler, in your scripts today.

WARNING: Still in a very early state, proceed with caution.

You can **try it out now** with this interactive [demo](http://sixlang.org/docs/demo/demo.html)

###Usage
```JavaScript
// Install
npm install six -g

// Execute
six myFile.js

// Compile
six --compile --output <OUTPUT> <SOURCE>
six -c -o <OUTPUT> <SOURCE>

// Watch and compile
six -cwo <OUTPUT> <SOURCE>

```


###Examples
```JavaScript

// Arrow Function
[ 1, 2, 3 ].forEach( item => print(item) )

// Classes
class Person {
  constructor(name) {
    this.name = name
  }
  greet() {
    print("Hello, my name is " + this.name + ".")
  }
}

// Template Literals
var me = new Person("Matthew")
print(`Hello, my name is ${me.name}.`)

// Object Property Shorthands
var prop = "erty"

var myObj = {

  // Implicit property initialization
  prop,

  // Method definition
  method() {
    print("method")
  }

}

// Rest parameters
function x( ...args ) {}

// Destructuring
var { c, d } = { c: 1, d: 2 }

// Iterators
var stuff = ["shoes", "shirt", "shorts"]

for(var thing of stuff) {
  print(thing)
}

// Importing modules from files or node modules
module path = "path"
module local = "./local.js"

// Aliasing modules
module files = fs

// Importing content from a module
import dirname from fs

// Importing content direct from a file
import local_function from "./local.js"

// Export a function from a module.
export function mod_func() { }

// Export variables from a module.
export var a = 400, b = {}

```

##Module Support
six outputs [UMD](https://github.com/umdjs/umd) compatible modules allowing modules to work in CommonJS environments such as node in addition to the web browser via an [AMD](http://requirejs.org/docs/whyamd.html) module environment such as [requirejs](http://requirejs.org/). Each file forms an implicit module whether a "module" declaration is used or not and thus the export (or the exports object) must be used to export data to the scope. The "-g" or "--global" command-line argument can be used to inhibit this behavior allowing code the possiblity to write directly to the global namespace when imported using an AMD module loader.

##About
The Six project is building on top of the work already being done by different individuals and groups around the web. Particularly influential is the amazing work done by [Ariya Hidayat](https://github.com/ariya) and collaborators on the ECMAScript parser [Esprima](http://esprima.org).

The project was started out of a desire to build on the work done with the [Harmonizr](https://github.com/jdiamond/harmonizr) project by [Jason Diamond](https://github.com/jdiamond) and still borrows some of its internals from that source.

A good deal of the work being done on and around the general workflows and APIs has been modeled after the very successfull [CoffeeScript](http://coffeescript.or) project by [Jeremy Ashkenas](https://github.com/jashkenas).

The ability to offer a tool such as this can't possibly exist without the members of [es-discuss](https://mail.mozilla.org/listinfo/es-discuss), and all the great people involved with [TC39](http://www.ecma-international.org/memento/TC39.htm) and standardization of the ECMAScript language.

I have a fundamental belief in the philosophies around these projects and the open web in general. I believe this platform's future is vital to us all and I want to do everything I can to help move the needle.

I'm betting on JavaScript.
