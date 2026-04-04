import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTProgress from "../../class/zhenftProgress.ts";
import { ZhenFT } from "../../class/zhenft.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";

const DAY_MS = 1_000 * 60 * 60 * 24;

const formatRelative = (time: number) => {
    return time > 0 ? `<t:${Math.floor(time / 1_000)}:R>` : "Never";
};

const buildLibrarySummary = (library: Record<string, ZhenFT>) => {
    const entries = Object.entries(library)
        .sort((a, b) => (b[1]?.obtained ?? 0) - (a[1]?.obtained ?? 0))
        .slice(0, 8);

    if (entries.length === 0) {
        return "No ZhenFTs yet";
    }

    return entries
        .map(
            ([id, zhenft]) =>
                `**${id}** - ${ZhenFTUtils.getPartName("body", zhenft.body)} - ${ZhenFTUtils.getPartName("face", zhenft.face)}`,
        )
        .join("\n");
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

    const zhenftId = interaction.options.getString("zhenft");

    if (zhenftId) {
        const zhenft: ZhenFT = userData.library[zhenftId];

        if (!zhenft) {
            return client.utils.interactionWarning(
                interaction,
                "That ZhenFT ID isn't in your library.",
            );
        }

        await interaction.deferReply();

        const image = await ZhenFTUtils.generateImage(
            zhenft.color,
            zhenft.accessory,
            zhenft.body,
            zhenft.face,
            zhenft.head,
        );

        const attachment = new AttachmentBuilder(
            await image.encode("png"),
        ).setName(`${zhenftId}.png`);

        const embed = ZhenFTUtils
            .embed(client, "ZhenFT Details")
            .setDescription(`Viewing **${zhenftId}** from your collection.`)
            .setImage(`attachment://${zhenftId}.png`)
            .addFields(
                {
                    name: "Traits",
                    value: [
                        `Accessory: ${ZhenFTUtils.getPartName("accessory", zhenft.accessory)}`,
                        `Body: ${ZhenFTUtils.getPartName("body", zhenft.body)}`,
                        `Face: ${ZhenFTUtils.getPartName("face", zhenft.face)}`,
                        `Head: ${ZhenFTUtils.getPartName("head", zhenft.head)}`,
                    ].join("\n"),
                },
                {
                    name: "Color",
                    value: zhenft.color,
                    inline: true,
                },
                {
                    name: "Obtained",
                    value: formatRelative(zhenft.obtained),
                    inline: true,
                },
                {
                    name: "Owners",
                    value:
                        zhenft.owners?.length > 0
                            ? zhenft.owners
                                .map((owner) => `<@${owner.id}>`)
                                .join("\n")
                            : "Unknown",
                    inline: true,
                },
            );

        return interaction.editReply({
            embeds: [embed],
            files: [attachment],
        });
    }

    await interaction.deferReply();

    const tokenMax = ZhenFTProgress.getTokenMax(userData);
    const libraryMax = ZhenFTProgress.getLibraryMax(userData);
    const lastClaimed = userData.dailyStreak.lastClaimed ?? 0;
    const nextClaim = lastClaimed > 0 ? lastClaimed + DAY_MS : 0;

    const embed = ZhenFTUtils
        .embed(client, "ZhenFT Profile")
        .setDescription(
            "Overview of your ZhenFT progress, inventory, and collection.",
        )
        .addFields(
            {
                name: "Progress",
                value: [
                    `Tokens: **${client.utils.formatNumber(userData.token)} / ${client.utils.formatNumber(tokenMax)}**`,
                    `Library: **${client.utils.formatNumber(Object.keys(userData.library).length)} / ${client.utils.formatNumber(libraryMax)}**`,
                    `Collected Lifetime: **${client.utils.formatNumber(userData.collectionTotal)}**`,
                    `Badges: **${client.utils.formatNumber(Object.keys(userData.badges).length)}**`,
                ].join("\n"),
                inline: true,
            },
            {
                name: "Daily",
                value: [
                    `Streak: **${client.utils.formatNumber(userData.dailyStreak.amount ?? 0)}**`,
                    `Last Claim: ${formatRelative(lastClaimed)}`,
                    `Next Claim: ${formatRelative(nextClaim)}`,
                ].join("\n"),
                inline: true,
            },
            {
                name: "Items",
                value: ZhenFTProgress.formatInventory(
                    client,
                    userData.items.inventory,
                ),
            },
            {
                name: "Badges",
                value: ZhenFTProgress.formatBadgeList(userData.badges),
            },
            {
                name: "Recent Library",
                value: buildLibrarySummary(userData.library),
            },
        );

    return interaction.editReply({ embeds: [embed] });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("profile")
    .setDescription("View your ZhenFT profile or inspect one ZhenFT")
    .addStringOption(
        new SlashCommandStringOption()
            .setName("zhenft")
            .setDescription("Optional ZhenFT ID to inspect"),
    );
