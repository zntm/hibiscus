// @bun
var __require = import.meta.require;

// src/cmd/rate.ts
import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { CommandCategory, CommandMetadata } from "../class/metadata.js";
var run = async (interaction, client) => {
  let prompt = interaction.options.getString("prompt") ?? "", promptSeed = prompt;
  if (/\<\@[0-9]+\>/.test(prompt.trim()))
    promptSeed = prompt?.slice(2, -1);
  let seed = promptSeed.trim().split("").reduce((d, v) => d ^ d + v.charCodeAt(0) * 427819, 0), rate = Math.round(seed) % 11 / 2, starDescription = "";
  if (rate > 0) {
    if (starDescription = "\u2B50".repeat(rate), rate % 1 > 0)
      starDescription += "<:star_half:1276821948848017410>";
    starDescription += "<:star_empty:1276821956406280304>".repeat(5 - Math.ceil(rate));
  } else
    starDescription = "<:star_empty:1276821956406280304>".repeat(5);
  let embed = client.utils.embedBuilder("Rate", "\u2B50", 16755763).setDescription(`I rate ${prompt} ${rate} ${rate === 1 ? "star" : "stars"}!
` + starDescription);
  interaction.reply({ embeds: [embed] });
}, metadata = new CommandMetadata(CommandCategory.Fun, new SlashCommandBuilder().setName("rate").setDescription("Check the star rating of a prompt").addStringOption(new SlashCommandStringOption().setName("prompt").setDescription("Set the prompt you want to check the star rating of").setRequired(!0)));
export {
  run,
  metadata
};
