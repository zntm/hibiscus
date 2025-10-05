import { Attachment, AttachmentBuilder, ChannelType, ChatInputCommandInteraction } from 'discord.js'
import { join } from 'path'

import { IClient } from '../../app.ts'
import { TerminalMetadata } from '../../class/metadata.ts'

export const run = async (interaction: ChatInputCommandInteraction, client: IClient, args: string[], attachment: Attachment) => {
    args.forEach(async (i) => {
        const dir = join(__dirname, `../../.res/guide/${i}.json`);
        
        const file = Bun.file(dir);
        const { data } = await file.json();

        for (let { title, emoji, color, description, image } of data)
        {
            if (color !== undefined)
            {
                color = parseInt(color, 16);
            }

            if (description !== undefined)
            {
                description = description.replaceAll('{{time}}', `<t:${Math.floor(Date.now() / 1000)}:F>`)
            }

            const embed = client.utils.embedBuilder(title, emoji, color)
            	.setDescription(description ?? null);
            
            if (image !== undefined)
            {
                const attachment = new AttachmentBuilder(join(dir, `../${image}`))
                    .setName(image);
                
                embed.setImage(`attachment://${image}`);

                // @ts-ignore
                await interaction.channel?.send({
                    embeds: [ embed ],
                    files: [ attachment ]
                });
            }
            else
            {
                // @ts-ignore
                await interaction.channel?.send({ embeds: [ embed ] });
            }
        }
    });
}

export const metadata = new TerminalMetadata()
    .addUser('805697813908160512');