import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import itemData from "../../resources/zhenft/json/item.json";

const DAY_MS = 1_000 * 60 * 60 * 24;
const WEEK_MS = DAY_MS * 7;
const SHOP_ITEM_IDS = [
    "fusionCatalyst",
    "fusionAmplifier",
    "tokenExpansion",
    "libraryExpansion",
] as const;

type ShopItemId = (typeof SHOP_ITEM_IDS)[number];

class ShopItem {
    public amount: number;
    public price: number;
    public lastRefresh: number;

    constructor(amount: number, price: number, lastRefresh: number = Date.now()) {
        this.amount = amount;
        this.price = price;
        this.lastRefresh = lastRefresh;
    }
}

const buildShopItem = (id: ShopItemId) => {
    const data = itemData[id].itemShop;

    return new ShopItem(data.suggestedAmount, data.suggestedPrice);
};

const getRefreshWindow = (refreshType: string) => {
    return refreshType === "weekly" ? WEEK_MS : DAY_MS;
};

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    await interaction.deferReply();

    const guildId = interaction.guild?.id ?? "global";
    const itemShopData =
        (await client.db.zhenftGlobal.find(guildId, { itemShop: 1 }))[0]
            ?.itemShop ?? {};
    let shouldPersist = false;

    for (const id of SHOP_ITEM_IDS) {
        const refreshType = itemData[id].itemShop.refreshType;
        const currentItem = itemShopData[id];

        if (!currentItem) {
            itemShopData[id] = buildShopItem(id);
            shouldPersist = true;
            continue;
        }

        const lastRefresh = currentItem.lastRefresh ?? 0;

        if (Date.now() - lastRefresh >= getRefreshWindow(refreshType)) {
            itemShopData[id] = buildShopItem(id);
            shouldPersist = true;
        }
    }

    if (shouldPersist) {
        await client.db.zhenftGlobal.update(guildId, {
            itemShop: itemShopData,
        });
    }

    const embed = ZhenFTUtils
        .embed(client, "Item Shop")
        .setDescription("Current stock for ZhenFT utility items.");

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
