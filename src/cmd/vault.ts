import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'
import { join } from 'path'

import { IClient } from '../index.ts'
import { CommandCategory, CommandMetadata } from '../class/metadata.ts'

const responseError = [
    'A connection tried. A failure returned.',
    'A soft hum... then silence.',
    'All you hear is your own breath.',
    'But nobody came.',
    'Did you expect something else?',
    'Everything feels... off.',
    'I feel watched.',
    'Is this line still open?',
    'It echoes, but does not return.',
    'It slips through your fingers.',
    'Maybe it was a lie?',
    'No answer. Not yet.',
    'No signal. Just static.',
    'No trace of them remains.',
    'Not now. Maybe never.',
    'Nothing answered back.',
    'Only echoes remain.',
    'Silence...',
    'Something moved... but not towards you.',
    'Still... nothing.',
    'Still waiting...',
    'That... wasn\'t the right one.',
    'That name has been lost.',
    'That presence is gone.',
    'The air shifts. Nothing comes.',
    'The response died before it began.',
    'The signal fades.',
    'The system stirs, then sleeps again.',
    'There\'s nothing here.',
    'This channel is... abandoned.',
    'This voice isn\'t meant to reply.',
    'Time doesn\'t move here.',
    'Try again... if you dare.',
    'Unresponsive. Like always.',
    'Weakened connection sickens me.',
    'You almost heard something.',
    'You felt something. Then it left.',
    'You reach, and reach, and reach.',
    'You\'re asking the wrong dream.',
    'You\'re not alone. But you\'re not with anyone, either.'
]

export const run = async (interaction: ChatInputCommandInteraction, client: IClient) => {
    await interaction.deferReply();

    const prompt = interaction.options.getString('prompt') ?? '';

    const file = Bun.file(join(__dirname, '../.res/vault.json'));
    const json = await file.json();

    client.utils.wait(1_000 * 5);

    const response = json[prompt];

    const embed = client.utils.embedBuilder('Vault', '🔒', 0xAAB8C2);

    if (!response)
    {
        embed.setDescription(client.utils.choose(responseError));
    }
    else
    {
        embed.setDescription(Array.isArray(response) ? client.utils.choose(response) : response);
    }

    interaction.editReply({ embeds: [ embed ] });
}

export const metadata = new CommandMetadata(CommandCategory.Fun, new SlashCommandBuilder()
    .setName('vault')
    .setDescription('Get a response with a code from the vault')
    .addStringOption(new SlashCommandStringOption()
        .setName('prompt')
        .setDescription('Set the prompt you want to get a response from')
        .setMinLength(1)
        .setRequired(true)));