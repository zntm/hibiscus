import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "discord.js";

import { IClient } from "../index.ts";
import { CommandCategory, CommandMetadata } from "../class/metadata.ts";

const regex = [
    [/l|r/, "w"],
    ["e", "ye"],
    ["i", "yi"],
    ["me", "meh"],
    ["mo", "myo"],
    ["n", "ny"],
    [/n(y+)e/, "nye"],
    ["the", "da"],
    ["th", "d"],
];

const suffix: string[] = [
    "~",
    " uwu",
    " owo",
    " >w<",
    " ~//~",
    " o3o",
    " :3",
    " ;3",
    " ~!",
];

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    let content = interaction.options.getString("prompt") ?? "";

    for (const [i, j] of regex) {
        // @ts-ignore
        content = content.replaceAll(i, j);
    }

    if (client.utils.chance(0.2)) {
        content += client.utils.choose(suffix);
    }

    const embed = client.utils
        .embedBuilder("UwU", "😽", 0xffcc4d)
        .setDescription(content);

    interaction.reply({ embeds: [embed] });
};

export const metadata = new CommandMetadata(
    CommandCategory.Fun,
    new SlashCommandBuilder()
        .setName("uwu")
        .setDescription("UwU-fy a prompt")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("prompt")
                .setDescription("Set the prompt you want to UwU-fy")
                .setRequired(true),
        ),
);
