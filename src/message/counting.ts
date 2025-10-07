import { channel } from '../config.json'
import { IClient } from '../index.ts'
import { CountingSettings } from '../schema/global.ts'
import { TerminalMetadata } from '../class/metadata.ts'

const setCounter = async (message: any, client: IClient, counting: any, lastUser: string, number: number, reaction: string) => {
    counting ??= {}
    
    counting.lastUser = lastUser;
    counting.number = number;
    counting.lastUpdate = new Date().getTime();

    await client.db.global.update(message.guild.id, { counting });
    await message.react(reaction);
}

const resetCounter = async (message: any, client: IClient, counting: any, description: string) => {
    await setCounter(message, client, counting, '', 0, '❌');
    
    const embed = client.utils.embedBuilder('Counting', '<:counting:1401915312680603698>', 0x9543D8)
        .setDescription(description);

    await message.reply({ embeds: [ embed ] });
}

export const run = async (message: any, client: IClient) => {
	if (message.author.bot || message.content.length <= 0) return;

	const userId = message.author.id;
	const number = +message.content;
    
    const data = (await client.db.global.find(message.guild.id))[0];
    const counting = data?.counting;

    if (!counting)
    {
        await setCounter(message, client, counting, userId, 1, '✅');
        
        return;
    }
    
    const settings = counting?.settings ?? 0;
    
    if (isNaN(number))
    {
        if ((settings & CountingSettings.IsNumberStrict) !== 0)
        {
            await resetCounter(message, client, counting, 'You are not allowed to send a messsage that\'s not a number! Number has been reset back to 1.');
        }
        
        return;
	}
    
    const nextNumber = data.counting.number + 1;
    
    if (number !== nextNumber)
    {
        await resetCounter(message, client, counting, `That number is incorrect! The next number was **${nextNumber}**! Number has been reset back to 1.`);

        return;
    }
    
    if ((settings & CountingSettings.IsUserStrict) !== 0 && counting.lastUser === userId)
    {
        await resetCounter(message, client, counting, 'You are not allowed to count multiple times in a row! Number has been reset back to 1.');

        return;
    }
    
    await setCounter(message, client, counting, userId, nextNumber, (nextNumber === 100 ? '💯' : '✅'));
}

export const info = new TerminalMetadata()
    .addChannel(channel.counting);