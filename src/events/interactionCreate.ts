import { ChannelType } from 'discord.js'

const runCommand = (interaction: any, id: string, error: string) => {
    interaction.client.commands.get(id)
        ?.run(interaction, interaction.client)
        ?.catch(() => {
            interaction.client.utils.interactionWarning(interaction, error);

            console.error(error);
        });
}

export default (interaction: any) => {
    if (interaction.channel?.type === ChannelType.DM)
    {
        return interaction.client.utils.interactionWarning(interaction, 'Commands can\'t be used in DMs!');
    }
    
    if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand())
    {
        runCommand(interaction, interaction.commandName, 'There was an error running this command!');
        
        return;
    }
    
    if (interaction.isAutocomplete())
    {
        interaction.client.commands.get(interaction.commandName).autocomplete(interaction, interaction.client);

        return;
    }
    
    if (interaction.isModalSubmit())
    {
        runCommand(interaction, interaction.customId, 'There was an error running this modal submission!');
        
        return;
    }
}