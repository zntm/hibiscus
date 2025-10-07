// @bun
var __require = import.meta.require;

// src/class/utils.ts
import { ButtonBuilder, ButtonStyle, ContainerBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { setTimeout as wait } from "timers/promises";

class Utils {
  _appColor = 10184447;
  getAppColor() {
    return this._appColor;
  }
  buttonBuilder(customId, label, style, disabled = !1) {
    let button = new ButtonBuilder().setLabel(label).setDisabled(disabled);
    if (/^[a-z][a-z0-9+.-]*:\/\/[^\s]+$/i.test(customId))
      button.setStyle(ButtonStyle.Link).setURL(customId);
    else
      button.setStyle(style ?? ButtonStyle.Primary).setCustomId(customId);
    return button;
  }
  containerBuilder(color = null) {
    let container = new ContainerBuilder;
    if (color !== null)
      container.setAccentColor(color);
    return container;
  }
  embedBuilder(title, emoji, color) {
    if (title !== void 0 && emoji !== void 0)
      title = `${emoji} \u2022 ${title}`;
    return new EmbedBuilder().setColor(color ?? null).setTitle(title ?? null);
  }
  _embedWarning = this.embedBuilder("Warning", "\u26A0\uFE0F", 16750848);
  interactionWarning = async (interaction, description) => {
    return this._embedWarning.setDescription(description).setTimestamp(), await interaction[interaction.deferred ? "editReply" : "reply"]({
      embeds: [this._embedWarning],
      flags: MessageFlags.Ephemeral
    });
  };
  _uptimeDate = Object.freeze(/* @__PURE__ */ new Date);
  getUptimeDate() {
    return this._uptimeDate;
  }
  _webhookData = Object.freeze({
    name: "Phantasia",
    avatar: "https://cdn.discordapp.com/attachments/1273919876855103542/1273921643755999272/phantasia.png?ex=66c05f7c&is=66bf0dfc&hm=37a992479acee740705ef73d21e3f113b1ae0aa7d15e0c277119bdf12148246c&"
  });
  async getWebhook(interaction) {
    let webhook = await interaction.channel.fetchWebhooks();
    return webhook = webhook.find((webhook2) => webhook2.name === this._webhookData.name), webhook ? webhook : await interaction.channel.createWebhook(this._webhookData);
  }
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  chance(percentage = 0.5) {
    return Math.random() < this.clamp(percentage, 0, 1);
  }
  choose(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  chooseWeight(data) {
    let totalWeight = data.reduce((sum, v) => sum + v.weight, 0), random = Math.random() * totalWeight;
    for (let i = 0;i < data.length; ++i) {
      let { value, weight } = data[i];
      if (random -= weight, random <= 0)
        return {
          value,
          index: i
        };
    }
    return {
      value: data[0].value,
      index: 0
    };
  }
  formatNumber(value) {
    return new Intl.NumberFormat().format(Math.floor(value)).toString();
  }
  formatTitle(string) {
    return string.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  random(max) {
    return Math.random() * max;
  }
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  }
  randomSeeded(seed) {
    return seed ^= seed << 13, seed ^= seed >> 17, seed ^= seed << 5, (seed >>> 0) / 4294967295;
  }
  async wait(time) {
    return await wait(1000 * time);
  }
}
export {
  Utils as default
};
