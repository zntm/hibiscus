import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'

import { IClient } from '../app.ts'
import { CommandCategory, CommandMetadata } from '../class/metadata.ts'

export const run = async (interaction: ChatInputCommandInteraction, client: IClient) => {
    const prompt = interaction.options.getString('prompt') ?? '';
    let promptSeed = prompt;

    if (/\<\@[0-9]+\>/.test(prompt.trim()))
    {
        promptSeed = prompt?.slice(2, -1);
    }

    const seed = promptSeed
        .trim()
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
            `I rate ${prompt} ${rate} ${(rate === 1 ? 'star' : 'stars')}!\n` +
            starDescription
        );
    
    interaction.reply({ embeds: [ embed ] });
}

export const metadata = new CommandMetadata(CommandCategory.Fun, new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Check the star rating of a prompt')
    .addStringOption(new SlashCommandStringOption()
        .setName('prompt')
        .setDescription('Set the prompt you want to check the star rating of')
        .setRequired(true)));