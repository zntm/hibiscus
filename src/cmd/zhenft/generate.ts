import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import { BaseValue } from "../../schema/zhenftUser.ts";
import { ZhenFT } from "../../class/zhenft.ts";

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    const userData = (await client.db.zhenftUser.find(interaction.user.id))[0];

    if (!userData) {
        return client.utils.interactionWarning(
            interaction,
            "You don't have a ZhenFT profile yet. Run `/zhenft start` first.",
        );
    }

    userData.library ??= {};
    userData.libraryMaxIncrement ??= 0;
    userData.token ??= 0;

    if (userData.token < BaseValue.PriceGeneration) {
        return client.utils.interactionWarning(
            interaction,
            "You don't have enough tokens to generate a ZhenFT.",
        );
    }

    const libraryMax = BaseValue.LibraryMax + userData.libraryMaxIncrement;

    if (Object.keys(userData.library).length >= libraryMax) {
        return client.utils.interactionWarning(
            interaction,
            "Your ZhenFT library is full.",
        );
    }

    await interaction.deferReply();

    const id = ZhenFTUtils.generateId(client);
    const color = `#${Math.floor(client.utils.random(0x1000000)).toString(16).padStart(6, "0")}`;

    const accessory = ZhenFTUtils.choosePart(client, "accessory");
    const body = ZhenFTUtils.choosePart(client, "body");
    const face = ZhenFTUtils.choosePart(client, "face");
    const head = ZhenFTUtils.choosePart(client, "head");

    const zhenft = new ZhenFT(
        color,
        accessory,
        body,
        face,
        head,
        new Date().getTime(),
    ).addOwner(interaction.user.id, new Date().getTime());

    userData.token -= BaseValue.PriceGeneration;
    userData.library[id] = zhenft;

    await client.db.zhenftUser.update(interaction.user.id, userData);

    const image = await ZhenFTUtils.generateImage(
        color,
        accessory,
        body,
        face,
        head,
    );

    const attachment = new AttachmentBuilder(
        await image.encode("png"),
    ).setName(`${id}.png`);

    const embed = ZhenFTUtils
        .embed(client, "ZhenFT Generated")
        .setDescription(
            `Generated **${id}** for **${client.utils.formatNumber(BaseValue.PriceGeneration)} tokens**.`,
        )
        .setImage(`attachment://${id}.png`)
        .addFields(
            {
                name: "ID",
                value: id,
                inline: true,
            },
            {
                name: "Balance",
                value: `${client.utils.formatNumber(userData.token)} tokens`,
                inline: true,
            },
            {
                name: "Traits",
                value: [
                    `Accessory: ${ZhenFTUtils.getPartName("accessory", accessory)}`,
                    `Body: ${ZhenFTUtils.getPartName("body", body)}`,
                    `Face: ${ZhenFTUtils.getPartName("face", face)}`,
                    `Head: ${ZhenFTUtils.getPartName("head", head)}`,
                ].join("\n"),
            },
        );

    return interaction.editReply({
        embeds: [embed],
        files: [attachment],
    });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("generate")
    .setDescription(
        `Generate a ZhenFT (costs ${BaseValue.PriceGeneration} tokens)`,
    );
