// @bun
import{ActionRowBuilder as m,ButtonBuilder as p,ButtonStyle as b}from"discord.js";var c={catharsis:12520779,leap_of_faith:12520779,phantasia:12520779,ruins:12520779},g=async(e,l)=>{let t=e.fields.getTextInputValue("name")??null,n=c[t];if(n===void 0)return;let o=e.fields.getTextInputValue("version")??null,s=e.fields.getTextInputValue("emoji")??null,i=`A new version has been released!
`+e.fields.getTextInputValue("changes").replaceAll("\r","").split(`
`).map((d)=>`- ${d.trim()}`).join(`
`),u=l.utils.embedBuilder(`${t} - ${o}`,s,n).setDescription(i),r=new p().setURL(e.fields.getTextInputValue("url")).setLabel("See Changelog").setStyle(b.Link),a=new m().addComponents(r);await e.reply({embeds:[u],components:[a]})};export{g as run};
