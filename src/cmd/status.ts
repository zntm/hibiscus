import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

import { IClient } from '../index.ts'
import { CommandCategory, CommandMetadata } from '../class/metadata.ts'

enum MemoryUsage {
    rss          = 'RSS',
    heapTotal    = 'Heap Total',
    heapUsed     = 'Heap Used',
    external     = 'External',
    arrayBuffers = 'Array Buffers'
}

export const run = async (interaction: ChatInputCommandInteraction, client: IClient) => {
    const uptime = (client?.uptime ?? 0) / 1_000;
    const uptimeDate = client.utils.getUptimeDate().getTime() / 1_000;

    const seconds = Math.floor(uptime)		% 60;
    const minutes = Math.floor(uptime / 60)	% 60;
    const hours   = Math.floor(uptime / 3_600);

    const memoryUsage: any = process.memoryUsage();

    const embed = client.utils.embedBuilder('Status', '🔍', 0x6B71A2)
    	.addFields([
            {
                name: 'Uptime',
                value: `${client.utils.formatNumber(hours).padStart(2, '0')}h:${client.utils.formatNumber(minutes / 60).padStart(2, '0')}m:${client.utils.formatNumber(seconds).padStart(2, '0')}s\n` +
        `<t:${Math.round(uptimeDate)}:R>`,
                inline: true
            },
            {
                name: 'Memory',
                value: `${Object.keys(memoryUsage)
                    .map((key: string) => {
                        const mb = memoryUsage[key] / 1_024 / 1_024;

                        return `${MemoryUsage[key as keyof typeof MemoryUsage]}: ${mb > 1 ? `${mb.toFixed(2)} MB` : `${(memoryUsage[key] / 1024).toFixed(2)} KB`}`
                    })
                    .join('\n')}`,
                inline: true
            }
        ]);
    
    interaction.reply({ embeds: [ embed ] });
}

export const metadata = new CommandMetadata(CommandCategory.General, new SlashCommandBuilder()
    .setName('status')
    .setDescription('View general status about the bot'));