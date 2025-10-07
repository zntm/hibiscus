import { Attachment, ChatInputCommandInteraction, TextChannel } from 'discord.js'

import { channel } from '../../config.json'
import { IClient } from '../../app.ts'
import { TerminalMetadata } from '../../class/metadata.ts'

const starboardData: any = {
    copper: {
        name: 'Copper',
        emoji: '',
        color: 0x000000
    },
    iron: {
        name: 'Iron',
        emoji: '',
        color: 0x000000
    },
    gold: {
        name: 'Gold',
        emoji: '',
        color: 0x000000
    },
    platinum: {
        name: 'Platinum',
        emoji: '',
        color: 0x000000
    }
}

export const run = async (interaction: ChatInputCommandInteraction, client: IClient, args: string[], attachment: Attachment) => {
    const [ messageId, rating ] = args;

    const m = await interaction.channel?.messages.fetch(messageId);

    if (!m) return;
    
    const c = await client.channels.fetch(channel.starboard);

    if (c instanceof TextChannel)
    {
        let { starboard } = (await client.db.user.find(m?.author.id))[0];

        if (starboard !== undefined)
        {
            starboard[rating] = (starboard[rating] ?? 0) + 1;

            await client.db.user.update(m?.author.id, { starboard });
        }
        else
        {
            await client.db.user.update(m?.author.id, {
                starboard: {
                    [ rating ]: 1
                }
            });
        }

        const data = starboardData[rating];

        const lastLetter = m.author.displayName.charAt(m.author.displayName.length - 1);
        const suffix = ([ 's', 'x', 'z' ].includes(lastLetter) ? lastLetter : '');

        const embed = client.utils.embedBuilder('Starboard', data.emoji, data.color)
            .setDescription(
                `<@${m?.author.id}>'${suffix} content has been added to the starboard!\n\n` +
                `https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}/${messageId}`
            )
            .setImage(m.attachments.first()?.url ?? null)
            .setTimestamp();

        c.send({ embeds: [ embed ] });
    }
}

export const metadata = new TerminalMetadata()
    .addUser('805697813908160512');