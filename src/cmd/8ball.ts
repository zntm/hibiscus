import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

import { IClient } from '../index.ts'
import data from '../resources/8ball.json'
import { CommandCategory, CommandMetadata } from '../class/metadata.ts'

const parseText = (client: IClient, data: any) => {
    let text = '';
    
    if (typeof data !== 'string')
    {
        text = data.text;

        if (data.prefix)
        {
            text = `${client.utils.choose(data.prefix)}${text}`;
        }

        if (data.suffix)
        {
            text = `${text}${client.utils.choose(data.suffix)}`;
        }
    }
    else
    {
        text = data;
    }

    return text;
}

const editResponse = async (interaction: ChatInputCommandInteraction, client: IClient, embed: EmbedBuilder, description: string, data: string[]) => {
    await client.utils.wait(3);
    
    embed.setDescription(`${description} ...${parseText(client, client.utils.choose(data))}`);

    await interaction.editReply({ embeds: [ embed ] });
}

export const run = async (interaction: ChatInputCommandInteraction, client: IClient) => {
    await interaction.deferReply();

    const description: any = client.utils.choose(data.response);
    let descriptionText = parseText(client, description);

    const embed = client.utils.embedBuilder('8Ball', '🎱', 0x31373D)
        .setDescription(descriptionText);

    await interaction.editReply({ embeds: [ embed ] });

    if (description?.editPositive && client.utils.chance(0.1))
    {
        await editResponse(interaction, client, embed, descriptionText, description.editPositive);
    }
    else if (description?.editNegative && client.utils.chance(0.1))
    {
        await editResponse(interaction, client, embed, descriptionText, description.editNegative);
    }
}

export const metadata = new CommandMetadata(CommandCategory.Fun, new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Shake the magic 8ball and get a random response'));