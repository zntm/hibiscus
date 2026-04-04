import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import itemData from "../../resources/zhenft/json/item.json";
import { SHOP_ITEM_IDS, syncItemShop } from "../../class/zhenftShop.ts";

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    await interaction.deferReply();

    const guildId = interaction.guild?.id ?? "global";
    const itemShopData = await syncItemShop(client, guildId);

    const embed = ZhenFTUtils
        .embed(client, "Item Shop")
        .setDescription(
            "Current stock for ZhenFT utility items.\nUse `/zhenft buy` to purchase from this shop.",
        );

    for (const id of SHOP_ITEM_IDS) {
        const data = itemShopData[id];
        const refreshLabel =
            itemData[id].itemShop.refreshType === "weekly" ? "Weekly" : "Daily";

        embed.addFields({
            name: itemData[id].name,
            value: [
                itemData[id].description,
                `Stock: **${client.utils.formatNumber(data.amount)}**`,
                `Price: **${client.utils.formatNumber(data.price)} tokens**`,
                `Refresh: **${refreshLabel}**`,
            ].join("\n"),
        });
    }

    return interaction.editReply({ embeds: [embed] });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("item_shop")
    .setDescription("View the ZhenFT item shop");
