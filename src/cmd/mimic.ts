import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "discord.js";

import { IClient } from "../index.ts";
import { CommandCategory, CommandMetadata } from "../class/metadata.ts";

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const user = interaction.options.getUser("user");

    if (!user) {
        return client.utils.interactionWarning(
            interaction,
            "You need to specify a user to mimic!",
        );
    }

    if (user.bot) {
        return client.utils.interactionWarning(
            interaction,
            "To avoid confusion, you can't mimic a bot!",
        );
    }

    const userId = interaction.user.id;

    if (user.id === userId) {
        return client.utils.interactionWarning(
            interaction,
            "You can't mimic yourself!",
        );
    }

    const webhook = await client.utils.getWebhook(interaction);
    const content = interaction.options.getString("prompt");

    await webhook.send({
        username: user.globalName,
        avatarURL: user.displayAvatarURL({
            size: 128,
            forceStatic: false,
        }),
        content,
    });

    const embed = client.utils
        .embedBuilder("Mimic", "🎭", 0xa6d388)
        .setDescription(`Sucessfully mimicked <@${user.id}>!`);

    interaction.editReply({ embeds: [embed] });
};

export const metadata = new CommandMetadata(
    CommandCategory.Fun,
    new SlashCommandBuilder()
        .setName("mimic")
        .setDescription("Mimic someone using their global name")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("user")
                .setDescription("Set the user you want to mimic")
                .setRequired(true),
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("prompt")
                .setDescription("Set the message you want the mimic to display")
                .setRequired(true),
        ),
);
