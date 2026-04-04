import itemData from "../resources/zhenft/json/item.json";

const DAY_MS = 1_000 * 60 * 60 * 24;
const WEEK_MS = DAY_MS * 7;

export const SHOP_ITEM_IDS = [
    "fusionCatalyst",
    "fusionAmplifier",
    "tokenExpansion",
    "libraryExpansion",
] as const;

export type ShopItemId = (typeof SHOP_ITEM_IDS)[number];

export class ShopItem {
    public amount: number;
    public price: number;
    public lastRefresh: number;

    constructor(amount: number, price: number, lastRefresh: number = Date.now()) {
        this.amount = amount;
        this.price = price;
        this.lastRefresh = lastRefresh;
    }
}

export const buildShopItem = (id: ShopItemId) => {
    const data = itemData[id].itemShop;

    return new ShopItem(data.suggestedAmount, data.suggestedPrice);
};

const getRefreshWindow = (refreshType: string) => {
    return refreshType === "weekly" ? WEEK_MS : DAY_MS;
};

export const syncItemShop = async (client: any, guildId: string) => {
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

    return itemShopData;
};
