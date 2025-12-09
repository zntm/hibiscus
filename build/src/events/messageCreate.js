// @bun
import{readdirSync as e}from"fs";import{join as d}from"path";var a=import.meta.dirname,m=e(d(a,"../message")).filter((n)=>n.endsWith(".js")).map((n)=>import.meta.require(`../message/${n}`)),f=(n)=>{let r=n.channel.id,i=n.author.id;for(let{run:o,metadata:t}of m)if(t.hasUser(i)&&t.hasChannel(r)){o(n,n.client,n.content.split(" "));return}};export{f as default};
