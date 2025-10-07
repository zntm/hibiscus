import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalSubmitInteraction } from 'discord.js'

import { IClient } from '../../index.ts'

const embedColor = {
    phantasia: 0xBF0D4B
}

export const run = async (interaction: ModalSubmitInteraction, client: IClient) => {
    const name = interaction.fields.getTextInputValue('name') ?? null;
    
    const color = embedColor[name];
    
    if (color === undefined) return;
    
    const version = interaction.fields.getTextInputValue('version') ?? null;
    const emoji = interaction.fields.getTextInputValue('emoji') ?? null;
    
	const description =
        'A new version has been released!\n' +
        interaction.fields.getTextInputValue('changes')
            .replaceAll('\r', '')
    		.split('\n')
            .map((i: string) => `- ${i.trim()}`)
            .join('\n');
        
    const embed = client.utils.embedBuilder(`${name} - ${version}`, emoji, color)
    	.setDescription(description);
    
    const button = new ButtonBuilder()
        .setURL(interaction.fields.getTextInputValue('url'))
        .setLabel('See Changelog')
        .setStyle(ButtonStyle.Link);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button);
    
    await interaction.reply({
        embeds: [ embed ],
        components: [ row ]
    });
}