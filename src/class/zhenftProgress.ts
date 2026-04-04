import badgeData from "../resources/zhenft/json/badge.json";
import itemData from "../resources/zhenft/json/item.json";
import { BaseValue } from "../schema/zhenftUser.ts";

const BADGE_MILESTONES = [
    { id: "daily30", value: 30, type: "daily" },
    { id: "daily100", value: 100, type: "daily" },
    { id: "daily365", value: 365, type: "daily" },
    { id: "zhenft100", value: 100, type: "collection" },
    { id: "zhenft250", value: 250, type: "collection" },
    { id: "zhenft500", value: 500, type: "collection" },
    { id: "zhenft1000", value: 1000, type: "collection" },
] as const;

const ITEM_IDS = Object.keys(itemData);

export default abstract class ZhenFTProgress {
    public static ensureUserData(userData: any) {
        userData.library ??= {};
        userData.libraryMaxIncrement ??= 0;
        userData.token ??= 0;
        userData.tokenMaxIncrement ??= 0;
        userData.tokenTotal ??= 0;
        userData.collectionTotal ??= 0;
        userData.dailyStreak ??= {
            amount: 0,
            lastClaimed: 0,
        };
        userData.effects ??= {};
        userData.items ??= {
            inventory: {},
            active: {},
        };
        userData.items.inventory ??= {};
        userData.items.active ??= {};
        userData.badges ??= {};

        for (const id of ITEM_IDS) {
            userData.items.inventory[id] ??= 0;
        }

        return userData;
    }

    public static getLibraryMax(userData: any) {
        return BaseValue.LibraryMax + (userData.libraryMaxIncrement ?? 0);
    }

    public static getTokenMax(userData: any) {
        return BaseValue.TokenMax + (userData.tokenMaxIncrement ?? 0);
    }

    public static syncBadges(userData: any) {
        this.ensureUserData(userData);

        const unlocked: string[] = [];
        const dailyAmount = userData.dailyStreak.amount ?? 0;
        const collectionTotal = userData.collectionTotal ?? 0;

        for (const milestone of BADGE_MILESTONES) {
            const amount =
                milestone.type === "daily" ? dailyAmount : collectionTotal;

            if (amount < milestone.value || userData.badges[milestone.id]) {
                continue;
            }

            userData.badges[milestone.id] = {
                obtained: Date.now(),
            };
            unlocked.push(milestone.id);
        }

        return unlocked;
    }

    public static formatBadgeList(badges: Record<string, any>) {
        const badgeIds = Object.keys(badges ?? {});

        if (badgeIds.length === 0) {
            return "None yet";
        }

        return badgeIds
            .sort((a, b) => (badges[b]?.obtained ?? 0) - (badges[a]?.obtained ?? 0))
            .map((id) => badgeData[id as keyof typeof badgeData]?.name ?? id)
            .join("\n");
    }

    public static formatInventory(client: any, inventory: Record<string, number>) {
        const lines = Object.entries(itemData).map(([id, data]) =>
            `${data.name}: **${client.utils.formatNumber(inventory[id] ?? 0)}**`,
        );

        return lines.join("\n");
    }

    public static formatUnlockedBadges(unlocked: string[]) {
        if (unlocked.length === 0) {
            return null;
        }

        return unlocked
            .map((id) => `- ${badgeData[id as keyof typeof badgeData]?.name ?? id}`)
            .join("\n");
    }
}
