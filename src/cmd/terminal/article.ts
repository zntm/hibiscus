import { ActionRowBuilder, Attachment, AttachmentBuilder, ButtonBuilder, ChatInputCommandInteraction, ContainerBuilder, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThreadAutoArchiveDuration } from 'discord.js'
import { unzipSync } from 'fflate'

import { channel as c, role } from '../../../config.json'
import { IClient } from '../../app.ts'
import { HEX2DEC } from '../../class/colorsys.ts'
import { TerminalMetadata } from '../../class/metadata.ts'

const separatorData = {
    large: new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large),
    small: new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
}

export const run = async (interaction: ChatInputCommandInteraction, client: IClient, args: string[], attachment: Attachment) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    if (!attachment.contentType?.includes('/zip'))
    {
        return client.utils.interactionWarning(interaction, 'The attachment is not a zip file!');
    }

    const file = await Bun.fetch(attachment.url);

    const zip = await file.arrayBuffer();
    const zipContent = unzipSync(Buffer.from(zip));
    
    const fileData: any = {}

    Object
        .entries(zipContent)
        .forEach(([ rawName, u8 ]) => {
            if (!rawName.endsWith('/'))
            {
                const name = rawName.replaceAll('\0', '').trim();
                const buffer = Buffer.from(u8);
                
                fileData[name] = { name, buffer }
            }
        });

    const components: ContainerBuilder[] = [];

    const { data, title }: any = Bun.YAML.parse((fileData['data.yml'] ?? fileData['data.yaml']).buffer.toString('utf8'));

    data.forEach(({ color, content }: any) => {
        const container = client.utils.containerBuilder(color ? HEX2DEC(color) : null);

        content?.forEach(({ type, value }: any) => {
            switch (type)
            {
            
            case 'file':
                const file = new FileBuilder()
                    .setSpoiler(value?.spoiler ?? false)
                    .setURL(`attachment://a_${value.url}`);
                
                container.addFileComponents(file);
                break;
            
            case 'image':
                const media = new MediaGalleryBuilder();

                value.forEach((v: any) => {
                    const item = new MediaGalleryItemBuilder()
                        .setSpoiler(v?.spoiler ?? false)
                        .setURL(`attachment://a_${v.url}`);
                    
                    if (v?.description)
                    {
                        item.setDescription(v.description);
                    }

                    media.addItems(item);
                });

                container.addMediaGalleryComponents(media);
                break;
            
            case 'separator':
                if (value === 'large')
                {
                    container.addSeparatorComponents(separatorData.large);
                }    
                else if (value === 'small')
                {
                    container.addSeparatorComponents(separatorData.small);
                }
                break;
            
            case 'text':
                const text = new TextDisplayBuilder()
                    .setContent(value);
                
                container.addTextDisplayComponents(text);
                break;
            
            case 'url':
                const components = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(value.map(({ label, url }: any) => client.utils.buttonBuilder(url, label)));
                
                container.addActionRowComponents(components);
                break;
            
            }
        });

        components.push(container);
    });

    const channel = await interaction.guild?.channels.fetch('1405116743361499256');
    const files = Object
        .values(fileData)
        .filter((f: any) => f.name.startsWith('resources/'))
        .map((f: any) => new AttachmentBuilder(f.buffer)
            .setName(`a_${f.name.substring('resources/'.length)}`));
    
    // @ts-ignore
    channel?.threads.create({
        name: title,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
        reason: 'test',
        message: {
            components,
            files,
            flags: MessageFlags.IsComponentsV2,
        },
    });
}

export const metadata = new TerminalMetadata()
    .addUser('805697813908160512')
    .addRole(role.articleWriter);