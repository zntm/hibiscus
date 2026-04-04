import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import { BaseValue } from "../../schema/zhenftUser.ts";
import ZhenFTProgress from "../../class/zhenftProgress.ts";

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    const userData = (await client.db.zhenftUser.find(interaction.user.id))[0];

    if (userData) {
        return client.utils.interactionWarning(
            interaction,
            "You already have a profile!",
        );
    }

    await interaction.deferReply();

    const time = new Date().getTime();
    const profileData = ZhenFTProgress.ensureUserData({
        library: {},
        libraryMaxIncrement: 0,
        token: BaseValue.TokenInit,
        tokenMaxIncrement: 0,
        tokenTotal: BaseValue.TokenInit,
        collectionTotal: 0,
        dailyStreak: {
            amount: 0,
            lastClaimed: 0,
        },
        effects: {},
        items: {
            inventory: {
                fusionCatalyst: 5,
                fusionAmplifier: 0,
                libraryExpansion: 0,
                tokenExpansion: 0,
            },
            active: {},
        },
        badges: {},
        timeStart: time,
    });

    await client.db.zhenftUser.update(interaction.user.id, profileData);

    const embed = ZhenFTUtils
        .embed(client, "Profile Created")
        .setDescription(
            "Your ZhenFT profile is ready. You received **5,000 tokens** and **5 Fusion Catalysts** to get started.",
        );

    return interaction.editReply({ embeds: [embed] });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("start")
    .setDescription("Create your ZhenFT profile");
