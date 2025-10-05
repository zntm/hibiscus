import { Attachment, MessageFlags, ChatInputCommandInteraction } from 'discord.js'

import { IClient } from '../../app.ts'
import { TerminalMetadata } from '../../class/metadata.ts'

export const run = async (interaction: ChatInputCommandInteraction, client: IClient, args: string[], attachment: Attachment) => {
    if (!global.gc)
    {
        return client.utils.interactionWarning(interaction, 'Manual garbage collection is not enabled!');
    }

    global.gc();

    const embed = client.utils.embedBuilder('Garbage Collection', '🗑️', 0x94A4AD)
        .setDescription('Garbage collected!');

    interaction.reply({
        embeds: [ embed ],
        flags: MessageFlags.Ephemeral
    });
}

export const metadata = new TerminalMetadata()
    .addUser('805697813908160512');