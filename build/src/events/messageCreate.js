// @bun
import{readdirSync as a}from"fs";import{join as m}from"path";var e=import.meta.dirname,s=a(m(e,"../message")).filter((n)=>n.endsWith(".js")).map((n)=>import.meta.require(`../message/${n}`)),f=(n)=>{let t=n.channel.id,i=n.author.id;for(let{run:o,info:r}of s)if(r.hasUser(i)&&r.hasChannel(t)){o(n,n.client);return}};export{f as default};
