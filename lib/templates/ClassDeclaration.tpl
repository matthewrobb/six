{<params}
  {#value.params}{name}{/value.params}
{/params}

{<body}
  {#extract target=value.body /};
{/body}

{<constructor}
  {#body.body className=id.name}
    {@if cond="'{key.name}'==='constructor'"}
      var {className} = function {className}({+params/}) {+body/}
    {/if}
  {/body.body}
{/constructor}

var {id.name} = (function(){

  {+constructor/}

  Test.prototype = {
    {#body.body}
      {@if cond="'{key.name}'!=='constructor'"}
        {key.name}: function({#value.params}{name}{/value.params}){#extract target=value.body /}
      {/if}
    {/body.body}
  };

  return {id.name};
  
}).call();