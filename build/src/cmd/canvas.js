// @bun
var __require = import.meta.require;

// src/cmd/canvas.ts
import { AttachmentBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { createCanvas } from "@napi-rs/canvas";
import { role } from "../config.js";
import { CommandCategory, CommandMetadata } from "../class/metadata.js";
import { join } from "path";
var b09fd1 = "E:\\GitHub\\hibiscus\\build\\src\\cmd";
var colorData = /* @__PURE__ */ new Map;
(await Bun.file(join(b09fd1, "../resources/canvas.dat")).text()).replaceAll("\r", "").split(`
`).forEach((i) => {
  let [id, name, hex, roles] = i.split(",");
  colorData.set(id, {
    name,
    hex: `#${hex}`,
    roles: roles?.split(":")
  });
});
var canvas = createCanvas(256 /* ImageSize */, 256 /* ImageSize */), context = canvas.getContext("2d"), getIndex = (x, y, size) => {
  return x = (x % size + size) % size, y = (y % size + size) % size, y * size + x;
}, compressCanvasData = (canvasData) => {
  let data = {};
  colorData.keys().toArray().forEach((i) => data[i] = []);
  for (let i = 0;i < canvasData.length; ) {
    let id = canvasData[i];
    if (id === void 0) {
      ++i;
      continue;
    }
    let length = 1;
    while (canvasData[i + length] === id)
      ++length;
    data[id].push(length << 16 | i), i += length;
  }
  return data;
}, decompressCanvasData = (canvasData) => {
  let data = Array(4096).fill(void 0);
  return Object.entries(canvasData).forEach(([name, value]) => {
    value.forEach((packed) => {
      let index = packed & 65535, length = packed >> 16 & 65535;
      for (let i = 0;i < length; ++i)
        data[index + i] = name;
    });
  }), data;
}, run = async (interaction, client) => {
  await interaction.deferReply();
  let x = interaction.options.getInteger("x") ?? 0, y = interaction.options.getInteger("y") ?? 0, color = interaction.options.getString("color") ?? "", brushSize = interaction.options.getInteger("brush-size") ?? 1, isPaint = interaction.options.getSubcommand() === "paint";
  if (isPaint && !Bun.env?.DEVELOPER_ID?.includes(interaction.user.id)) {
    let member = await interaction.guild?.members.fetch(interaction.user.id);
    if (brushSize > 1 && !member?.roles.cache.every((r) => r.id === role.booster))
      return client.utils.interactionWarning(interaction, `Only <@&${role.booster}> can change brush size!`);
    let roles = colorData.get(color)?.roles;
    if (roles !== void 0 && !member?.roles.cache.every((r) => roles.includes(r.id)))
      return client.utils.interactionWarning(interaction, "You don't have the required roles to use that color!");
  }
  let canvasData = (await client.db.global.find(interaction.guild?.id))[0]?.canvas;
  if (canvasData) {
    if (canvasData.data = decompressCanvasData(canvasData.data), canvasData.size !== 64 /* Size */) {
      let canvasNewData = [], canvasOldSize = canvasData.size;
      for (let x2 = 0;x2 < canvasOldSize; ++x2)
        for (let y2 = 0;y2 < canvasOldSize; ++y2)
          canvasNewData[getIndex(x2, y2, 64 /* Size */)] = canvasData[getIndex(x2, y2, canvasOldSize)];
      canvasData.data = canvasNewData, canvasData.size = 64 /* Size */;
    }
  } else
    canvasData.data = Array(4096).fill(void 0), canvasData.size = 64 /* Size */;
  let embed = client.utils.embedBuilder("Canvas", "\uD83C\uDFA8", 14130304).setImage("attachment://canvas.png").setTimestamp();
  if (isPaint) {
    let threshold = (brushSize / 2) ** 2;
    for (let i = -brushSize;i <= brushSize; ++i) {
      let x2 = x + i;
      if (x2 < 0 || x2 >= 64 /* Size */)
        continue;
      for (let j = -brushSize;j <= brushSize; ++j) {
        let y2 = y + j;
        if (y2 < 0 || y2 >= 64 /* Size */)
          continue;
        if ((brushSize % 1 !== 0 ? (i + 0.5) ** 2 + (j + 0.5) ** 2 : i ** 2 + j ** 2) > threshold)
          continue;
        canvasData.data[getIndex(x2, y2, 64 /* Size */)] = color;
      }
    }
    await client.db.global.update(interaction.guild?.id ?? "", {
      canvas: {
        data: compressCanvasData(canvasData.data),
        size: 64 /* Size */
      }
    });
  }
  context.fillStyle = "#ffffff", context.fillRect(0, 0, 256 /* ImageSize */, 256 /* ImageSize */);
  for (let x2 = 0;x2 < 64 /* Size */; ++x2)
    for (let y2 = 0;y2 < 64 /* Size */; ++y2) {
      let color2 = canvasData.data[getIndex(x2, y2, 64 /* Size */)];
      if (color2 === void 0)
        continue;
      let hex = colorData.get(color2)?.hex;
      if (hex === "#ffffff")
        continue;
      context.fillStyle = hex, context.fillRect(x2 * 4 /* PixelSize */, y2 * 4 /* PixelSize */, 4 /* PixelSize */, 4 /* PixelSize */);
    }
  let attachment = new AttachmentBuilder(await canvas.encode("png")).setName("canvas.png");
  interaction.editReply({
    embeds: [embed],
    files: [attachment]
  });
}, metadata = new CommandMetadata(CommandCategory.Fun, new SlashCommandBuilder().setName("canvas").setDescription("View or contribute to the shared community canvas").addSubcommand(new SlashCommandSubcommandBuilder().setName("display").setDescription("Display the current version of the community canvas")).addSubcommand(new SlashCommandSubcommandBuilder().setName("paint").setDescription("Paint on the community canvas").addIntegerOption(new SlashCommandIntegerOption().setName("x").setDescription("Set the x coordinate of the brush").setMinValue(0).setMaxValue(63).setRequired(!0)).addIntegerOption(new SlashCommandIntegerOption().setName("y").setDescription("Set the y coordinate of the brush").setMinValue(0).setMaxValue(63).setRequired(!0)).addStringOption(new SlashCommandStringOption().setName("color").setDescription("Choose a color to paint with").addChoices(colorData.entries().toArray().map(([index, { name }]) => ({
  name,
  value: index
}))).setRequired(!0)).addIntegerOption(new SlashCommandIntegerOption().setName("brush-size").setDescription("Size the brush size (boosters only)").setMinValue(1).setMaxValue(10))));
export {
  run,
  metadata
};
