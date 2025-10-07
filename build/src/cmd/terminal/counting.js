// @bun
var __require = import.meta.require;

// src/cmd/terminal/counting.ts
import { TerminalMetadata } from "../../class/metadata.js";
import { CountingSettings } from "../../schema/global.js";
var toggleSetting = async (interaction, client, option, boolean, enableMessage, disableMessage) => {
  if (option === "1" || option === "true") {
    await interaction.deferReply();
    let counting = (await client.db.global.find(interaction.guild?.id))[0]?.counting;
    counting.settings ??= 0, counting.settings |= boolean, await client.db.global.update(interaction.guild?.id, { counting });
    let embed = client.utils.embedBuilder("Counting", "<:counting:1401915312680603698>", 9782232).setDescription(enableMessage);
    interaction.editReply({ embeds: [embed] });
  } else if (option === "0" || option === "false") {
    await interaction.deferReply();
    let counting = (await client.db.global.find(interaction.guild?.id))[0]?.counting;
    if (counting.settings ??= 0, counting.settings & boolean)
      counting.settings ^= boolean;
    await client.db.global.update(interaction.guild?.id, { counting });
    let embed = client.utils.embedBuilder("Counting", "<:counting:1401915312680603698>", 9782232).setDescription(disableMessage);
    interaction.editReply({ embeds: [embed] });
  } else
    return client.utils.interactionWarning(interaction, "Argument is not a boolean!");
}, run = async (interaction, client, args, attachment) => {
  switch (args[0].toLowerCase()) {
    case "number":
      let number = +args[1];
      if (isNaN(number))
        return client.utils.interactionWarning(interaction, "Argument is not a number!");
      await interaction.deferReply();
      let counting = (await client.db.global.find(interaction.guild?.id))[0]?.counting;
      counting.number = number, counting.lastUpdate = (/* @__PURE__ */ new Date()).getTime(), counting.settings ??= 0, await client.db.global.update(interaction.guild?.id, { counting });
      let embed = client.utils.embedBuilder("Counting", "<:counting:1401915312680603698>", 9782232).setDescription(`Number has been set to **${number}**! The next number will be ${number + 1}.`);
      interaction.editReply({ embeds: [embed] });
      break;
    case "user-strict":
      toggleSetting(interaction, client, args[1], CountingSettings.IsUserStrict, "User strict has been enabled! You can no longer count multiple times in a row.", "User strict has been disabled!");
      break;
    case "number-strict":
      toggleSetting(interaction, client, args[1], CountingSettings.IsNumberStrict, "Number strict has been enabled! You can no longer send messages that are not a number.", "Number strict has been disabled!");
      break;
  }
}, metadata = new TerminalMetadata().addUser("805697813908160512");
export {
  run,
  metadata
};
