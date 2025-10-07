// @bun
var __require = import.meta.require;

// src/cmd/modal/update.ts
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
var embedColor = {
  phantasia: 12520779
}, run = async (interaction, client) => {
  let name = interaction.fields.getTextInputValue("name") ?? null, color = embedColor[name];
  if (color === void 0)
    return;
  let version = interaction.fields.getTextInputValue("version") ?? null, emoji = interaction.fields.getTextInputValue("emoji") ?? null, description = `A new version has been released!
` + interaction.fields.getTextInputValue("changes").replaceAll("\r", "").split(`
`).map((i) => `- ${i.trim()}`).join(`
`), embed = client.utils.embedBuilder(`${name} - ${version}`, emoji, color).setDescription(description), button = new ButtonBuilder().setURL(interaction.fields.getTextInputValue("url")).setLabel("See Changelog").setStyle(ButtonStyle.Link), row = new ActionRowBuilder().addComponents(button);
  await interaction.reply({
    embeds: [embed],
    components: [row]
  });
};
export {
  run
};
