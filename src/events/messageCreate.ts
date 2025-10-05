import { readdirSync } from 'fs'
import { join } from 'path';

const commands: any = readdirSync(join(__dirname, '../message'))
	.filter((i: string) => i.endsWith('.ts'))
	.map((file: string) => {
        const command = require(`../message/${file}`);

        return command;
    });

export default (message: any) => {
    const channelId = message.channel.id;
	const userId = message.author.id;
    
    for (const { run, info } of commands)
    {
        if ((info.getUsers() === undefined || info.hasUser(userId)) && (info.getChannels() === undefined || info.hasChannel(channelId)))
        {
            run(message, message.client);

            return;
        }
    }
}