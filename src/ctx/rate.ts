import { ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js'

import { IClient } from '../index.ts'
import { ContextMetadata } from '../class/metadata.ts'

export const run = (interaction: ContextMenuCommandInteraction, client: IClient) => {
    const user = interaction.targetId;

    const seed = user
        .split('')
        .reduce((d: number, v: string) => d ^ (d + (v.charCodeAt(0) * 427_819)), 0);

    const rate = (Math.round(seed) % 11) / 2;
    
    let starDescription = '';
    
    if (rate > 0)
    {
        starDescription = '⭐'.repeat(rate);

        if (rate % 1 > 0)
        {
            starDescription += '<:star_half:1276821948848017410>';
        }

        starDescription += '<:star_empty:1276821956406280304>'.repeat(5 - Math.ceil(rate));
    }
    else
    {
        starDescription = '<:star_empty:1276821956406280304>'.repeat(5);
    }

    const embed = client.utils.embedBuilder('Rate', '⭐', 0xFFAC33)
        .setDescription(
            `I rate <@${user}> ${rate} ${(rate === 1 ? 'star' : 'stars')}!\n` +
            starDescription
        );

    interaction.reply({ embeds: [ embed ] });
}

export const metadata = new ContextMetadata(new ContextMenuCommandBuilder()
    .setName('Rate User')
    .setType(ApplicationCommandType.User));