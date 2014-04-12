macro => {
    rule infix { ( $arg:ident (,) ... ) | { $body ... } } => {
        (function ( $arg (,) ... ) {
            $body ...
        }.bind(this))
    }
    rule infix { ( $arg:ident (,) ... ) | $ret ... } => {
        (function ( $arg (,) ... ) {
            return $ret ...
        }.bind(this))
    }
    rule infix { () | { $body ... } } => {
        (function ( ) { 
            $body ...
        }.bind(this))
    }
    rule infix { $arg:ident | { $body ... } } => {
        (function ($arg) { 
            $body ...
        }.bind(this))
    }
    rule infix { $arg:ident | $ret ... } => {
        (function ($arg) { 
            return $ret ...
        }.bind(this))
    }
}

export =>;