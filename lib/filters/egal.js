exports.filter = function anonymous(it) {
var out='('+( it.ast.operator === "isnt" ? "!" : "" )+'function ( x, y ) {return (x === y)?( x !== 0 || 1/x === 1/y ) : ( x !== x && y !==y )}( '+( it.first().compile() )+', '+( it.last().compile() )+' ))';return out;
}