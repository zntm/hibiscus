// @bun
var __require = import.meta.require;

// src/cmd/terminal/starboard.ts
import { TextChannel } from "discord.js";
import { channel } from "../../config.js";
import { TerminalMetadata } from "../../class/metadata.js";
var starboardData = {
  copper: {
    name: "Copper",
    emoji: "",
    color: 0
  },
  iron: {
    name: "Iron",
    emoji: "",
    color: 0
  },
  gold: {
    name: "Gold",
    emoji: "",
    color: 0
  },
  platinum: {
    name: "Platinum",
    emoji: "",
    color: 0
  }
}, run = async (interaction, client, args, attachment) => {
  let [messageId, rating] = args, m = await interaction.channel?.messages.fetch(messageId);
  if (!m)
    return;
  let c = await client.channels.fetch(channel.starboard);
  if (c instanceof TextChannel) {
    let { starboard } = (await client.db.user.find(m?.author.id))[0];
    if (starboard !== void 0)
      starboard[rating] = (starboard[rating] ?? 0) + 1, await client.db.user.update(m?.author.id, { starboard });
    else
      await client.db.user.update(m?.author.id, {
        starboard: {
          [rating]: 1
        }
      });
    let data = starboardData[rating], lastLetter = m.author.displayName.charAt(m.author.displayName.length - 1), suffix = ["s", "x", "z"].includes(lastLetter) ? lastLetter : "", embed = client.utils.embedBuilder("Starboard", data.emoji, data.color).setDescription(`<@${m?.author.id}>'${suffix} content has been added to the starboard!

https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${messageId}`).setImage(m.attachments.first()?.url ?? null).setTimestamp();
    c.send({ embeds: [embed] });
  }
}, metadata = new TerminalMetadata().addUser("805697813908160512");
export {
  run,
  metadata
};
