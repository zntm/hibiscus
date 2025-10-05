import { ChannelType, ChatInputCommandInteraction, Role, SlashCommandAttachmentOption, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'

import { IClient } from '../app.ts'
import { CommandCategory, CommandMetadata } from '../class/metadata.ts'

const subcommandData: Map<string, any> = new Map();

readdirSync(join(__dirname, './terminal'))
    .forEach(async (file: string) => {
		const key = file.slice(0, -3);

        subcommandData.set(key, await import(`./terminal/${file}`));
    });

export const run = async (interaction: ChatInputCommandInteraction, client: IClient) => {
    if (interaction.channel?.type !== ChannelType.GuildText)
    {
        return client.utils.interactionWarning(interaction, 'You don\'t have permission to use this command!');
    }

    const args = interaction.options.getString('prompt')?.split(' ');
	const subcommand = subcommandData.get(args?.shift() ?? '');

	if (!subcommand)
	{
        return client.utils.interactionWarning(interaction, 'This terminal command doesn\'t exist!');
	}

    if (!subcommand.metadata.hasUser(interaction.user.id))
    {
        return client.utils.interactionWarning(interaction, 'You don\'t have permission to use this command!');
    }

    const roles: Map<string, string> = subcommand.metadata.getRoles();

    if (roles)
    {
        const member = await interaction.guild?.members.fetch(interaction.user.id);

        if (!member?.roles.cache?.every((role: Role) => roles.has(role.id)))
        {
            return client.utils.interactionWarning(interaction, 'You don\'t have permission to use this command!');
        }
    }

    if (!subcommand.metadata.hasChannel(interaction.channel?.id))
    {
        return client.utils.interactionWarning(interaction, 'You are not in the correct channel to use this command!');
    }

	subcommand.run(interaction, client, args, interaction.options.getAttachment('attachment'));
}

export const metadata = new CommandMetadata(CommandCategory.Utility, new SlashCommandBuilder()
    .setName('terminal')
    .setDescription('Run a hidden command (usually used as hidden commands and developer tools)')
    .addStringOption(new SlashCommandStringOption()
        .setName('prompt')
        .setDescription('Set the prompt you want to run')
        .setRequired(true))
    .addAttachmentOption(new SlashCommandAttachmentOption()
        .setName('attachment')
        .setDescription('Send an attachment to the terminal command (optional)')));