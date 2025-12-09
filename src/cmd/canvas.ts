import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Role,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { createCanvas } from "@napi-rs/canvas";

import { role } from "../config.json";
import { IClient } from "../index.ts";
import { CommandCategory, CommandMetadata } from "../class/metadata.ts";

const enum Canvas {
    Size = 64,
    PixelSize = 4,
    ImageSize = Canvas.Size * Canvas.PixelSize,
    BrushMaxDistance = 10,
}

import colorData from "../resources/canvas.json";

const colorPalette: Map<string, [number, number, number]> = new Map();

for (const [key, { hex }] of Object.entries(colorData)) {
    colorPalette.set(key, [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ]);
}

const getIndex = (x: number, y: number, size: number) => {
    x = ((x % size) + size) % size;
    y = ((y % size) + size) % size;

    return y * size + x;
};

const compressCanvasData = (canvasData: string[]) => {
    const data: any = {};

    for (const i of Object.keys(colorData)) {
        data[i] = [];
    }

    for (let i = 0; i < canvasData.length; ) {
        let id = canvasData[i];

        if (id === undefined) {
            ++i;

            continue;
        }

        let length = 1;

        while (canvasData[i + length] === id) {
            ++length;
        }

        data[id].push((length << 16) | i);

        i += length;
    }

    return data;
};

const decompressCanvasData = (canvasData: any) => {
    const data = new Array(Canvas.Size ** 2).fill(undefined);

    for (const [name, value] of Object.entries(canvasData)) {
        // @ts-ignore
        for (const packed of value) {
            const index = packed & 0xffff;
            const length = (packed >>> 16) & 0xffff;

            for (let i = 0; i < length; ++i) {
                data[index + i] = name;
            }
        }
    }

    return data;
};

export const run = async (
    interaction: ChatInputCommandInteraction,
    client: IClient,
) => {
    await interaction.deferReply();

    const x = interaction.options.getInteger("x") ?? 0;
    const y = interaction.options.getInteger("y") ?? 0;

    const color = interaction.options.getString("color") ?? "";
    const brushSize = interaction.options.getInteger("brush-size") ?? 1;

    const isPaint = interaction.options.getSubcommand() === "paint";

    if (isPaint && !Bun.env?.DEVELOPER_ID?.includes(interaction.user.id)) {
        const member = await interaction.guild?.members.fetch(
            interaction.user.id,
        );

        if (
            brushSize > 1 &&
            !member?.roles.cache.every((r: Role) => r.id === role.booster)
        ) {
            return client.utils.interactionWarning(
                interaction,
                `Only <@&${role.booster}> can change brush size!`,
            );
        }

        // @ts-ignore
        const roles = colorData[color]?.roles;

        if (
            roles !== undefined &&
            !member?.roles.cache.every((r: Role) => roles.includes(r.id))
        ) {
            return client.utils.interactionWarning(
                interaction,
                "You don't have the required roles to use that color!",
            );
        }
    }

    const canvasData = (
        await client.db.global.findOne(interaction.guild?.id, {
            canvas: 1,
        })
    )?.canvas;

    if (canvasData) {
        canvasData.data = decompressCanvasData(canvasData.data);

        if (canvasData.size !== Canvas.Size) {
            const canvasNewData: string[] = [];
            const canvasOldSize = canvasData.size;

            for (let x = 0; x < canvasOldSize; ++x) {
                for (let y = 0; y < canvasOldSize; ++y) {
                    canvasNewData[getIndex(x, y, Canvas.Size)] =
                        canvasData[getIndex(x, y, canvasOldSize)];
                }
            }

            canvasData.data = canvasNewData;
            canvasData.size = Canvas.Size;
        }
    } else {
        canvasData.data = new Array(Canvas.Size ** 2).fill(undefined);
        canvasData.size = Canvas.Size;
    }

    const embed = client.utils
        .embedBuilder("Canvas", "🎨", 0xd79c80)
        .setImage("attachment://canvas.png")
        .setTimestamp();

    if (isPaint) {
        const threshold = (brushSize / 2) ** 2;

        for (let i = -brushSize; i <= brushSize; ++i) {
            const x2 = x + i;

            if (x2 < 0 || x2 >= Canvas.Size) continue;

            for (let j = -brushSize; j <= brushSize; ++j) {
                const y2 = y + j;

                if (y2 < 0 || y2 >= Canvas.Size) continue;

                if (
                    (brushSize % 1 !== 0
                        ? (i + 0.5) ** 2 + (j + 0.5) ** 2
                        : i ** 2 + j ** 2) > threshold
                )
                    continue;

                canvasData.data[getIndex(x2, y2, Canvas.Size)] = color;
            }
        }

        await client.db.global.update(interaction.guild?.id ?? "", {
            canvas: {
                data: compressCanvasData(canvasData.data),
                size: Canvas.Size,
            },
        });
    }

    const canvas = createCanvas(Canvas.ImageSize, Canvas.ImageSize);
    const context = canvas.getContext("2d");

    const imageData = context.createImageData(
        Canvas.ImageSize,
        Canvas.ImageSize,
    );
    const { data } = imageData;

    data.fill(255);

    for (let x = 0; x < Canvas.Size; ++x) {
        for (let y = 0; y < Canvas.Size; ++y) {
            const colorName = canvasData.data[getIndex(x, y, Canvas.Size)];

            if (colorName === undefined) continue;

            const rgb = colorPalette.get(colorName);

            if (!rgb) continue;

            const [r, g, b] = rgb;

            if (r === 255 && g === 255 && b === 255) continue;

            const startX = x * Canvas.PixelSize;
            const startY = y * Canvas.PixelSize;

            for (let py = 0; py < Canvas.PixelSize; ++py) {
                const rowOffset = (startY + py) * Canvas.ImageSize * 4;
                for (let px = 0; px < Canvas.PixelSize; ++px) {
                    const idx = rowOffset + (startX + px) * 4;

                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                }
            }
        }
    }

    context.putImageData(imageData, 0, 0);

    const attachment = new AttachmentBuilder(
        await canvas.encode("png"),
    ).setName("canvas.png");

    interaction.editReply({
        embeds: [embed],
        files: [attachment],
    });
};

export const metadata = new CommandMetadata(
    CommandCategory.Fun,
    new SlashCommandBuilder()
        .setName("canvas")
        .setDescription("View or contribute to the shared community canvas")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("display")
                .setDescription(
                    "Display the current version of the community canvas",
                ),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("paint")
                .setDescription("Paint on the community canvas")
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("x")
                        .setDescription("Set the x coordinate of the brush")
                        .setMinValue(0)
                        .setMaxValue(Canvas.Size - 1)
                        .setRequired(true),
                )
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("y")
                        .setDescription("Set the y coordinate of the brush")
                        .setMinValue(0)
                        .setMaxValue(Canvas.Size - 1)
                        .setRequired(true),
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("color")
                        .setDescription("Choose a color to paint with")
                        .addChoices(
                            Object.entries(colorData).map(
                                ([index, { name }]: any) => ({
                                    name,
                                    value: index,
                                }),
                            ),
                        )
                        .setRequired(true),
                )
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("brush-size")
                        .setDescription("Size the brush size (boosters only)")
                        .setMinValue(1)
                        .setMaxValue(10),
                ),
        ),
);
