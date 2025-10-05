import { ActionRowBuilder, Attachment, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

import { IClient } from '../../app.ts'
import { TerminalMetadata } from '../../class/metadata.ts'

const components: any = [
    new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Enter Name')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(50),
    new TextInputBuilder()
        .setCustomId('emoji')
        .setLabel('Enter Emoji')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(50),
    new TextInputBuilder()
        .setCustomId('version')
        .setLabel('Enter Version')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(50),
    new TextInputBuilder()
        .setCustomId('url')
        .setLabel('Enter URL')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(1)
        .setMaxLength(250),
    new TextInputBuilder()
        .setCustomId('changes')
        .setLabel('Enter Changes')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(1)
        .setMaxLength(500),
].map((i: TextInputBuilder) => new ActionRowBuilder().addComponents(i));

const modal = new ModalBuilder()
    .setCustomId('update')
    .setTitle('Update')
	.addComponents(...components);

export const run = async (interaction: ChatInputCommandInteraction, client: IClient, args: string[], attachment: Attachment) => {
    await interaction.showModal(modal);
}

export const metadata = new TerminalMetadata()
    .addUser('805697813908160512');