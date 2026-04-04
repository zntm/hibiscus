import { readdirSync } from "fs";
import { join } from "path";

import { CommandCategory, CommandMetadata } from "../class/metadata.ts";
import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../index.ts";

const subcommandData: Map<
    string,
    {
        run: (interaction: ChatInputCommandInteraction, client: IClient) => any;
        command: SlashCommandSubcommandBuilder;
    }
> = new Map();

for (const file of readdirSync(join(__dirname, "./zhenft")).filter((file) =>
    file.endsWith(".ts"),
)) {
    subcommandData.set(file.slice(0, -3), await import(`./zhenft/${file}`));
}

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    const subcommand = interaction.options.getSubcommand() ?? "";
    const command = subcommandData.get(subcommand);

    if (!command) {
        return client.utils.interactionWarning(
            interaction,
            "That ZhenFT action doesn't exist.",
        );
    }

    return command.run(interaction, client);
};

const slashCommand = new SlashCommandBuilder()
    .setName("zhenft")
    .setDescription("Manage your ZhenFT collection");

for (const value of subcommandData.values()) {
    slashCommand.addSubcommand(value.command);
}

export const metadata = new CommandMetadata(CommandCategory.Fun, slashCommand);
