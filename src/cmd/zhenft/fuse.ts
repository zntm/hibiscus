import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { IClient } from "../../index.ts";
import itemData from "../../resources/zhenft/json/item.json";
import { BaseValue } from "../../schema/zhenftUser.ts";
import ZhenFTUtils from "../../class/zhenftUtils.ts";
import { ZhenFT } from "../../class/zhenft.ts";

const blendColor = (color1: string, color2: string) => {
    const [r1, g1, b1] = [1, 3, 5].map((index) =>
        parseInt(color1.slice(index, index + 2), 16),
    );
    const [r2, g2, b2] = [1, 3, 5].map((index) =>
        parseInt(color2.slice(index, index + 2), 16),
    );

    return `#${Math.round((r1 + r2) / 2).toString(16).padStart(2, "0")}${Math.round((g1 + g2) / 2).toString(16).padStart(2, "0")}${Math.round((b1 + b2) / 2).toString(16).padStart(2, "0")}`;
};

const chooseFusedPart = (
    client: IClient,
    type: "accessory" | "body" | "face" | "head",
    part1: string,
    part2: string,
    hasFusionAmplifier: boolean,
) => {
    if (part1 === part2) {
        return part1;
    }

    const rarity1 = ZhenFTUtils.getPartRarity(type, part1);
    const rarity2 = ZhenFTUtils.getPartRarity(type, part2);

    if (rarity1 === rarity2) {
        return client.utils.chance(0.5) ? part1 : part2;
    }

    const higherPart = rarity1 > rarity2 ? part1 : part2;
    const lowerPart = higherPart === part1 ? part2 : part1;

    return client.utils.chance(hasFusionAmplifier ? 0.75 : 0.35)
        ? higherPart
        : lowerPart;
};

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
    userData.items ??= {
        inventory: {},
        active: {},
    };
    userData.items.inventory ??= {};
    userData.items.active ??= {};

    const zhenftId1 = interaction.options.getString("zhenft1") ?? "";
    const zhenftId2 = interaction.options.getString("zhenft2") ?? "";

    if (zhenftId1 === zhenftId2) {
        return client.utils.interactionWarning(
            interaction,
            "Choose two different ZhenFT IDs to fuse.",
        );
    }

    const zhenft1: ZhenFT = userData.library[zhenftId1];

    if (!zhenft1) {
        return client.utils.interactionWarning(
            interaction,
            "The first ZhenFT ID isn't in your library.",
        );
    }

    const zhenft2: ZhenFT = userData.library[zhenftId2];

    if (!zhenft2) {
        return client.utils.interactionWarning(
            interaction,
            "The second ZhenFT ID isn't in your library.",
        );
    }

    const fusionCatalystCount = userData.items.inventory.fusionCatalyst ?? 0;

    if (fusionCatalystCount <= 0) {
        return client.utils.interactionWarning(
            interaction,
            `You need a ${itemData.fusionCatalyst.name} to fuse two ZhenFTs.`,
        );
    }

    await interaction.deferReply();

    userData.items.inventory.fusionCatalyst = fusionCatalystCount - 1;

    let usedFusionAmplifier = false;

    if ((userData.items.active.fusionAmplifier ?? 0) > 0) {
        --userData.items.active.fusionAmplifier;
        usedFusionAmplifier = true;
    } else if ((userData.items.inventory.fusionAmplifier ?? 0) > 0) {
        --userData.items.inventory.fusionAmplifier;
        usedFusionAmplifier = true;
    }

    const id = ZhenFTUtils.generateId(client);

    const accessory = chooseFusedPart(
        client,
        "accessory",
        zhenft1.accessory,
        zhenft2.accessory,
        false,
    );

    const body = chooseFusedPart(
        client,
        "body",
        zhenft1.body,
        zhenft2.body,
        usedFusionAmplifier,
    );

    const face = chooseFusedPart(
        client,
        "face",
        zhenft1.face,
        zhenft2.face,
        usedFusionAmplifier,
    );

    const head = chooseFusedPart(
        client,
        "head",
        zhenft1.head,
        zhenft2.head,
        usedFusionAmplifier,
    );

    const zhenft = new ZhenFT(
        blendColor(zhenft1.color, zhenft2.color),
        accessory,
        body,
        face,
        head,
        new Date().getTime(),
    ).addOwner(interaction.user.id, new Date().getTime());

    delete userData.library[zhenftId1];
    delete userData.library[zhenftId2];
    userData.library[id] = zhenft;

    await client.db.zhenftUser.update(interaction.user.id, userData);

    const image = await ZhenFTUtils.generateImage(
        zhenft.color,
        accessory,
        body,
        face,
        head,
    );

    const attachment = new AttachmentBuilder(
        await image.encode("png"),
    ).setName(`${id}.png`);

    const embed = ZhenFTUtils
        .embed(client, "ZhenFT Fused")
        .setDescription(`Combined **${zhenftId1}** and **${zhenftId2}** into **${id}**.`)
        .setImage(`attachment://${id}.png`)
        .addFields(
            {
                name: "Traits",
                value: [
                    `Accessory: ${ZhenFTUtils.getPartName("accessory", accessory)}`,
                    `Body: ${ZhenFTUtils.getPartName("body", body)}`,
                    `Face: ${ZhenFTUtils.getPartName("face", face)}`,
                    `Head: ${ZhenFTUtils.getPartName("head", head)}`,
                ].join("\n"),
            },
            {
                name: "Items Used",
                value: [
                    "Fusion Catalyst: 1",
                    `Fusion Amplifier: ${usedFusionAmplifier ? 1 : 0}`,
                ].join("\n"),
                inline: true,
            },
            {
                name: "Catalysts Left",
                value: client.utils.formatNumber(
                    userData.items.inventory.fusionCatalyst,
                ),
                inline: true,
            },
        );

    return interaction.editReply({
        embeds: [embed],
        files: [attachment],
    });
};

export const command = new SlashCommandSubcommandBuilder()
    .setName("fuse")
    .setDescription("Fuse two ZhenFTs into a new one")
    .addStringOption(
        new SlashCommandStringOption()
            .setName("zhenft1")
            .setDescription("Choose the first ZhenFT ID to fuse")
            .setMaxLength(BaseValue.IDLengthMax)
            .setMinLength(BaseValue.IDLengthMin)
            .setRequired(true),
    )
    .addStringOption(
        new SlashCommandStringOption()
            .setName("zhenft2")
            .setDescription("Choose the second ZhenFT ID to fuse")
            .setMaxLength(BaseValue.IDLengthMax)
            .setMinLength(BaseValue.IDLengthMin)
            .setRequired(true),
    );
