let for = macro {
    case {_ (var $lhs of $rhs:expr) { $body ...} } => {
        return #{
            Object.defineProperty(($rhs), "@@iterator", {
                value : function(){
                    var self = this,
                        keys = Object.keys(self),
                        lastIndex=-1;

                    return {
                        next : function() {
                            return {
                                done : !keys[++lastIndex],
                                value : {
                                    key : keys[lastIndex],
                                    value : self[keys[lastIndex]]
                                }
                            };
                        }
                    };
                }
            });
    
            for (var iter = ($rhs)["@@iterator"](), item; iter && !(item = iter.next()).done;) {
                var $lhs = item.value;
                $body ...
            }
        }
    }

    case {_ $head } => {
        return #{
            for $head
        }
    }
}

export for;