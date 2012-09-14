exports.filter = function anonymous(it) {
var out='"';var arr1=it.select('.QuasiElement');if(arr1){var child,index=-1,l1=arr1.length-1;while(index<l1){child=arr1[index+=1];out+=' '+( child.ast.value.raw )+' ';if(it.select('expressions')[0] && it.select('expressions')[0].children[index]){out+=' " + '+( it.select('expressions')[0].children[index].compile() )+' + " ';}} } out+='"';return out;
}