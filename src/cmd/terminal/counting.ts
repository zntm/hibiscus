import { Attachment, ChatInputCommandInteraction } from 'discord.js'

import { IClient } from '../../app.ts'
import { TerminalMetadata } from '../../class/metadata.ts'
import { CountingSettings } from '../../schema/global.ts'

const toggleSetting = async (interaction: ChatInputCommandInteraction, client: IClient, option: string, boolean: number, enableMessage: string, disableMessage: string) => {
    if (option === '1' || option === 'true')
    {
        await interaction.deferReply();

        const counting = (await client.db.global.find(interaction.guild?.id))[0]?.counting;
		counting.settings ??= 0;
        
        counting.settings |= boolean;
		
        await client.db.global.update(interaction.guild?.id, { counting });

        const embed = client.utils.embedBuilder('Counting', '<:counting:1401915312680603698>', 0x9543D8)
        	.setDescription(enableMessage);

        interaction.editReply({ embeds: [ embed ] });
    }
    else if (option === '0' || option === 'false')
    {
        await interaction.deferReply();
        
        const counting = (await client.db.global.find(interaction.guild?.id))[0]?.counting;
		counting.settings ??= 0;
        
        if (counting.settings & boolean)
        {
            counting.settings ^= boolean;
        }
        
        await client.db.global.update(interaction.guild?.id, { counting });

        const embed = client.utils.embedBuilder('Counting', '<:counting:1401915312680603698>', 0x9543D8)
        	.setDescription(disableMessage);

        interaction.editReply({ embeds: [ embed ] });
    }
    else
    {
        return client.utils.interactionWarning(interaction, 'Argument is not a boolean!');
    }
}

export const run = async (interaction: ChatInputCommandInteraction, client: IClient, args: string[], attachment: Attachment) => {
    switch (args[0].toLowerCase())
    {
    
    case 'number':
        const number = +args[1];
        
        if (isNaN(number))
        {
            return client.utils.interactionWarning(interaction, 'Argument is not a number!');
        }
        
        await interaction.deferReply();
        
        const counting = (await client.db.global.find(interaction.guild?.id))[0]?.counting;
        
        counting.number = number;
        counting.lastUpdate = new Date().getTime();
        counting.settings ??= 0;
        
        await client.db.global.update(interaction.guild?.id, { counting });
        
        const embed = client.utils.embedBuilder('Counting', '<:counting:1401915312680603698>', 0x9543D8)
            .setDescription(`Number has been set to **${number}**! The next number will be ${number + 1}.`);
        
        interaction.editReply({ embeds: [ embed ] });
        break;
    
    case 'user-strict':
        toggleSetting(interaction, client, args[1], CountingSettings.IsUserStrict, 'User strict has been enabled! You can no longer count multiple times in a row.', 'User strict has been disabled!');
        break;
        
    case 'number-strict':
        toggleSetting(interaction, client, args[1], CountingSettings.IsNumberStrict, 'Number strict has been enabled! You can no longer send messages that are not a number.', 'Number strict has been disabled!');
        break;
    
    }
}

export const metadata = new TerminalMetadata()
    .addUser('805697813908160512');