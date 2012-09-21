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

###Examples
```JavaScript

// Arrow Function
[ 1, 2, 3 ].forEach( item => print(item) )

// Egal Operators
if(x isnt y && y is z) { }

// Classes
class Person {
  constructor(name) {
    this.name = name
  }
  greet() {
    print("Hello, my name is " + this.name + ".")
  }
}

// Quasi Literals / Template Strings
var me = new Person("Matthew")
print(`Hello, my name is ${me.name}.`)

// Object Property Shorthands
var myObj = {

  // Method definition
  method() {
    print("method")
  },
  
  // Implicit return, concise methods
  concise( x ) x + 1
}

// Default and Rest parameters
function x( y=0, ...z ) {}

// Spread
var x = [ 1, 2, 3 ]
print(...x)

// Destructuring
var [ a, b ] = x
var { c, d } = { c: 1, d: 2 }

// Iterators
var stuff = ["shoes", "shirt", "shorts"]

for(var thing of stuff) {
  print(thing)
}

// Comprehensions

// Modules

```

