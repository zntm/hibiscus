// @bun
import{readdirSync as o}from"fs";import{join as m}from"path";var i=import.meta.dirname,s=o(m(i,"../message")).filter((t)=>t.endsWith(".js")).map((t)=>import.meta.require(`../message/${t}`)),f=(t)=>{let a=t.channel.id,n=t.author.id;for(let{run:e,metadata:r}of s)if(r.hasUser(n)&&r.hasChannel(a)){e(t,t.client);return}};export{f as default};
