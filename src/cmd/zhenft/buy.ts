import {
    ChatInputCommandInteraction,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import itemData from "../../resources/zhenft/json/item.json";
import ZhenFTProgress from "../../class/zhenftProgress.ts";
import { SHOP_ITEM_IDS, type ShopItemId, syncItemShop } from "../../class/zhenftShop.ts";

const EXPANSION_VALUE: Partial<Record<ShopItemId, number>> = {
    tokenExpansion: 2_500,
    libraryExpansion: 10,
};

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    const userData = (await client.db.zhenftUser.find(interaction.user.id))[0];

    if (!userData) {
        return client.utils.interactionWarning(
            interaction,
            "You don't have a ZhenFT profile yet. Run `/zhenft start` first.",
        );
    }

    ZhenFTProgress.ensureUserData(userData);

    const itemId = (interaction.options.getString("item") ?? "") as ShopItemId;
    const quantity = interaction.options.getInteger("amount") ?? 1;

    if (!SHOP_ITEM_IDS.includes(itemId)) {
        return client.utils.interactionWarning(
            interaction,
            "That item isn't sold in the ZhenFT shop.",
        );
    }

    const guildId = interaction.guild?.id ?? "global";
    const itemShopData = await syncItemShop(client, guildId);
    const shopItem = itemShopData[itemId];

    if (!shopItem || shopItem.amount <= 0) {
        return client.utils.interactionWarning(
            interaction,
            `${itemData[itemId].name} is out of stock right now.`,
        );
    }

    if (quantity > shopItem.amount) {
        return client.utils.interactionWarning(
            interaction,
            `Only **${client.utils.formatNumber(shopItem.amount)}** ${itemData[itemId].name} ${shopItem.amount === 1 ? "is" : "are"} left in stock.`,
        );
    }

    const totalPrice = shopItem.price * quantity;

    if (userData.token < totalPrice) {
        return client.utils.interactionWarning(
            interaction,
            `You need **${client.utils.formatNumber(totalPrice)} tokens** for that purchase.`,
        );
    }

    await interaction.deferReply();

    userData.token -= totalPrice;
    shopItem.amount -= quantity;

    if (itemId === "tokenExpansion") {
        userData.tokenMaxIncrement += (EXPANSION_VALUE[itemId] ?? 0) * quantity;
    } else if (itemId === "libraryExpansion") {
        userData.libraryMaxIncrement +=
            (EXPANSION_VALUE[itemId] ?? 0) * quantity;
    } else {
        userData.items.inventory[itemId] =
            (userData.items.inventory[itemId] ?? 0) + quantity;
    }

    await Promise.all([
        client.db.zhenftUser.update(interaction.user.id, userData),
        client.db.zhenftGlobal.update(guildId, { itemShop: itemShopData }),
    ]);

    const appliedText =
        itemId === "tokenExpansion"
            ? `Token cap increased to **${client.utils.formatNumber(ZhenFTProgress.getTokenMax(userData))}**.`
            : itemId === "libraryExpansion"
                ? `Library cap increased to **${client.utils.formatNumber(ZhenFTProgress.getLibraryMax(userData))}**.`
                : `You now have **${client.utils.formatNumber(userData.items.inventory[itemId] ?? 0)}** ${itemData[itemId].name}${(userData.items.inventory[itemId] ?? 0) === 1 ? "" : "s"}.`;

    const embed = ZhenFTUtils
        .embed(client, "Purchase Complete")
        .setDescription(
            `Bought **${client.utils.formatNumber(quantity)}** ${itemData[itemId].name}${quantity === 1 ? "" : "s"} for **${client.utils.formatNumber(totalPrice)} tokens**.`,
        )
        .addFields(
            {
                name: "Stock Left",
                value: client.utils.formatNumber(shopItem.amount),
                inline: true,
            },
            {
                name: "Balance",
                value: `${client.utils.formatNumber(userData.token)} / ${client.utils.formatNumber(ZhenFTProgress.getTokenMax(userData))} tokens`,
                inline: true,
            },
            {
                name: "Effect",
                value: appliedText,
            },
        );

    return interaction.editReply({ embeds: [embed] });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the ZhenFT shop")
    .addStringOption(
        new SlashCommandStringOption()
            .setName("item")
            .setDescription("Choose which shop item to buy")
            .addChoices(
                SHOP_ITEM_IDS.map((id) => ({
                    name: itemData[id].name,
                    value: id,
                })),
            )
            .setRequired(true),
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
            .setName("amount")
            .setDescription("How many to buy")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true),
    );
