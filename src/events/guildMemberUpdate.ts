import { join } from 'path'

import { channel, role } from '../config.json'
import { IClient } from '../index.ts'

const file = Bun.file(join(__dirname, '../resources/welcome.dat'));

const welcome = (await file.text())
	.replaceAll('\r', '')
	.split('\n');

export default async (oldMember: any, newMember: any) => {
    if (!oldMember.pending || newMember.pending) return;
    
    const client: IClient = newMember.client;
    
    const description = client.utils.choose(welcome)
        .replaceAll('{{user}}', `<@${newMember.user.id}>`)
        .replaceAll('{{name}}', newMember.guild.name);
    
    const embed = client.utils.embedBuilder('Welcome', '👋', 0xFFDC5D)
    	.setDescription(description)
        .setThumbnail(newMember.displayAvatarURL({
            size: 128,
            dynamic: true
        }))
        .setTimestamp();
    
    const c = client.channels.cache.get(channel.welcome);

    if (!c) return;
    
    // @ts-ignore
    const response = await c.send({
        content: `<@${role.welcome}>`,
        embeds: [ embed ]
    });
    
    response.react('👋');
}