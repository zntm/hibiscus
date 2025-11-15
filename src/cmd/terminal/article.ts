import {
    ActionRowBuilder,
    Attachment,
    AttachmentBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    ContainerBuilder,
    FileBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThreadAutoArchiveDuration,
} from "discord.js";
import { unzipSync } from "fflate";

import { channel as c, role } from "../../config.json";
import { IClient } from "../../index.ts";
import { HEX2DEC } from "../../class/colorsys.ts";
import { TerminalMetadata } from "../../class/metadata.ts";

const separatorData = {
    large: new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
    small: new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
};

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
    args: string[],
    attachment: Attachment,
) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!attachment.contentType?.includes("/zip")) {
        return client.utils.interactionWarning(
            interaction,
            "The attachment is not a zip file!",
        );
    }

    const file = await Bun.fetch(attachment.url);

    const zip = await file.arrayBuffer();
    const zipContent = unzipSync(Buffer.from(zip));

    const fileData: any = {};

    for (const content of Object.entries(zipContent)) {
        const n = content[0];

        if (!n.endsWith("/")) {
            const name = n.replaceAll("\0", "").trim();
            const buffer = Buffer.from(content[1]);

            fileData[name] = { name, buffer };
        }
    }

    const components: ContainerBuilder[] = [];

    const { data, title }: any = Bun.YAML.parse(
        (fileData["data.yml"] ?? fileData["data.yaml"]).buffer.toString("utf8"),
    );

    for (const { color, content } of data) {
        const container = client.utils.containerBuilder(
            color ? HEX2DEC(color) : null,
        );

        for (const { type, value } of content) {
            if (type === "file") {
                const file = new FileBuilder()
                    .setSpoiler(value?.spoiler ?? false)
                    .setURL(`attachment://a_${value.url}`);

                container.addFileComponents(file);
            } else if (type === "image") {
                const media = new MediaGalleryBuilder();

                for (const v of value) {
                    const item = new MediaGalleryItemBuilder()
                        .setSpoiler(v?.spoiler ?? false)
                        .setURL(`attachment://a_${v.url}`);

                    if (v?.description) {
                        item.setDescription(v.description);
                    }

                    media.addItems(item);
                }

                container.addMediaGalleryComponents(media);
            } else if (type === "separator") {
                if (value === "large") {
                    container.addSeparatorComponents(separatorData.large);
                } else if (value === "small") {
                    container.addSeparatorComponents(separatorData.small);
                }
            } else if (type === "text") {
                const text = new TextDisplayBuilder().setContent(value);

                container.addTextDisplayComponents(text);
            } else if (type === "url") {
                const components =
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        value.map(({ label, url }: any) =>
                            client.utils.buttonBuilder(url, label),
                        ),
                    );

                container.addActionRowComponents(components);
            }
        }

        components.push(container);
    }

    const channel = await interaction.guild?.channels.fetch(
        "1405116743361499256",
    );

    const files = Object.values(fileData)
        .filter((f: any) => f.name.startsWith("resources/"))
        .map((f: any) =>
            new AttachmentBuilder(f.buffer).setName(
                `a_${f.name.substring("resources/".length)}`,
            ),
        );

    // @ts-ignore
    channel?.threads.create({
        name: title,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
        reason: "test",
        message: {
            components,
            files,
            flags: MessageFlags.IsComponentsV2,
        },
    });
};

export const metadata = new TerminalMetadata()
    .addUser("805697813908160512")
    .addRole(role.articleWriter);
