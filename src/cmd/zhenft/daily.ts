import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import { BaseValue } from "../../schema/zhenftUser.ts";

const DAY_MS = 1_000 * 60 * 60 * 24;

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

    userData.dailyStreak ??= {
        amount: 0,
        lastClaimed: 0,
    };
    userData.token ??= 0;
    userData.tokenMaxIncrement ??= 0;
    userData.tokenTotal ??= 0;

    const now = new Date().getTime();
    const lastClaimed = userData.dailyStreak.lastClaimed ?? 0;
    const dailyNext = lastClaimed + DAY_MS;

    if (lastClaimed !== 0 && now < dailyNext) {
        return client.utils.interactionWarning(
            interaction,
            `You can claim your next daily reward <t:${Math.floor(dailyNext / 1_000)}:R>.`,
        );
    }

    await interaction.deferReply();

    let dailyToken = Math.round(
        client.utils.randomRange(
            BaseValue.DailyTokenMin,
            BaseValue.DailyTokenMax,
        ),
    );
    const maintainedStreak =
        lastClaimed !== 0 && now <= lastClaimed + DAY_MS * 2;
    const nextStreakAmount = maintainedStreak
        ? Math.min(
            (userData.dailyStreak.amount ?? 0) + 1,
            BaseValue.DailyStreakMax,
        )
        : 1;
    const streakBonus =
        nextStreakAmount > 1
            ? Math.round(dailyToken * (nextStreakAmount / 10))
            : 0;

    dailyToken += streakBonus;

    const tokenMax = BaseValue.TokenMax + userData.tokenMaxIncrement;
    const tokenBefore = userData.token;
    const tokenAfter = Math.min(tokenBefore + dailyToken, tokenMax);
    const lostTokens = tokenBefore + dailyToken - tokenAfter;
    const claimedTokens = dailyToken - lostTokens;

    userData.token = tokenAfter;
    userData.tokenTotal += claimedTokens;
    userData.dailyStreak.amount = nextStreakAmount;
    userData.dailyStreak.lastClaimed = now;

    await client.db.zhenftUser.update(interaction.user.id, userData);

    const description = [
        claimedTokens > 0
            ? `You claimed **${client.utils.formatNumber(claimedTokens)} tokens**.`
            : "Your token storage is full, so no tokens were added this time.",
        streakBonus > 0
            ? `Daily streak bonus: **+${client.utils.formatNumber(streakBonus)} tokens**.`
            : null,
        lostTokens > 0
            ? `Token cap reached, so **${client.utils.formatNumber(lostTokens)} tokens** were lost.`
            : null,
        `Current streak: **${client.utils.formatNumber(nextStreakAmount)} day${nextStreakAmount === 1 ? "" : "s"}**.`,
        `Balance: **${client.utils.formatNumber(userData.token)} / ${client.utils.formatNumber(tokenMax)} tokens**.`,
        `Next claim: <t:${Math.floor((now + DAY_MS) / 1_000)}:R>.`,
    ]
        .filter(Boolean)
        .join("\n");

    const embed = ZhenFTUtils
        .embed(client, "Daily Reward")
        .setDescription(description);

    return interaction.editReply({ embeds: [embed] });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily ZhenFT tokens");
