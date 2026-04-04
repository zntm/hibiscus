import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "discord.js";

import { IClient } from "../index.ts";
import text from "../resources/text.json";
import { CommandCategory, CommandMetadata } from "../class/metadata.ts";

export const run = (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    // @ts-ignore
    const data = text[interaction.options.getString("type") ?? ""];

    let content = interaction.options.getString("prompt") ?? "";

    for (const key of Object.keys(text)) {
        content = content.replaceAll(key, data[key]);
    }

    interaction.reply({ content });
};

export const metadata = new CommandMetadata(
    CommandCategory.Utility,
    new SlashCommandBuilder()
        .setName("text")
        .setDescription("Convert text into a different style")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("type")
                .setDescription("Set the type of text you want to convert to")
                .addChoices(
                    ...Object.keys(text).map((key) => ({
                        name: key,
                        value: key,
                    })),
                )
                .setRequired(true),
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("prompt")
                .setDescription("Set the prompt you want to convert")
                .setRequired(true),
        ),
);
