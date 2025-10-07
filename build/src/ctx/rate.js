// @bun
var __require = import.meta.require;

// src/ctx/rate.ts
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMetadata } from "../class/metadata.js";
var run = (interaction, client) => {
  let user = interaction.targetId, seed = user.split("").reduce((d, v) => d ^ d + v.charCodeAt(0) * 427819, 0), rate = Math.round(seed) % 11 / 2, starDescription = "";
  if (rate > 0) {
    if (starDescription = "\u2B50".repeat(rate), rate % 1 > 0)
      starDescription += "<:star_half:1276821948848017410>";
    starDescription += "<:star_empty:1276821956406280304>".repeat(5 - Math.ceil(rate));
  } else
    starDescription = "<:star_empty:1276821956406280304>".repeat(5);
  let embed = client.utils.embedBuilder("Rate", "\u2B50", 16755763).setDescription(`I rate <@${user}> ${rate} ${rate === 1 ? "star" : "stars"}!
` + starDescription);
  interaction.reply({ embeds: [embed] });
}, metadata = new ContextMetadata(new ContextMenuCommandBuilder().setName("Rate User").setType(ApplicationCommandType.User));
export {
  run,
  metadata
};
