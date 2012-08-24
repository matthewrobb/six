{#body}
  {@if cond="'{type}'==='ClassDeclaration'"}
    {>ClassDeclaration/}
  {/if}


  {@if cond="'{type}'!=='ClassDeclaration'"}
    {#extract target=./}
  {/if}
{/body}