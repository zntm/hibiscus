import { SKRSContext2D, createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "path";

import type { IClient } from "../index.ts";
import { BaseValue } from "../schema/zhenftUser.ts";
import { ZhenFTRarity } from "./zhenft.ts";
import partData from "../resources/zhenft/json/part.json";

const CANVAS_SIZE = 640;
const IMAGE_ROOT = join(import.meta.dirname, "../resources/zhenft/img");

type ZhenFTPartType = "accessory" | "body" | "face" | "head";

type ZhenFTPartDefinition = {
    name?: string;
    price: number;
    rarity: string;
    weight: number;
};

const PART_DATA = partData as Record<
    ZhenFTPartType,
    Record<string, ZhenFTPartDefinition>
>;

const PART_ID_ALIASES: Partial<Record<ZhenFTPartType, Record<string, string>>> =
    {
        body: {
            sweater_light_purple: "sweater_purple",
        },
    };

const RARITY_VALUE: Record<string, ZhenFTRarity> = {
    common: ZhenFTRarity.Common,
    uncommon: ZhenFTRarity.Uncommon,
    rare: ZhenFTRarity.Rare,
    epic: ZhenFTRarity.Epic,
    mythic: ZhenFTRarity.Mythic,
};

export default abstract class ZhenFTUtils {
    public static readonly color = 0x9543d8;
    public static readonly emoji = "<:zhenft:1401915312680603698>";

    private static readonly _idCharacters: string =
        "123456767890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static generateId(client: IClient) {
        const length = Math.round(
            client.utils.randomRange(
                BaseValue.IDLengthMin,
                BaseValue.IDLengthMax,
            ),
        );

        let id = "";

        for (let i = 0; i < length; ++i) {
            id += client.utils.choose(ZhenFTUtils._idCharacters);
        }

        return id;
    }

    private static imageCache: Map<string, any> = new Map();

    private static _resolvePartId(type: ZhenFTPartType, id: string) {
        return PART_ID_ALIASES[type]?.[id] ?? id;
    }

    public static embed(client: IClient, title: string = "ZhenFT") {
        return client.utils.embedBuilder(title, this.emoji, this.color);
    }

    public static choosePart(client: IClient, type: ZhenFTPartType) {
        return client.utils.chooseWeight(
            Object.entries(PART_DATA[type]).map(([value, data]) => ({
                value,
                weight: data.weight,
            })),
        ).value;
    }

    public static getPartName(type: ZhenFTPartType, id: string) {
        if (id === "0") {
            return "None";
        }

        const resolvedId = this._resolvePartId(type, id);
        const part = PART_DATA[type][resolvedId] ?? PART_DATA[type][id];

        return part?.name ?? resolvedId.replaceAll("_", " ");
    }

    public static getPartRarity(type: ZhenFTPartType, id: string) {
        const resolvedId = this._resolvePartId(type, id);
        const part = PART_DATA[type][resolvedId] ?? PART_DATA[type][id];
        const rarity = part?.rarity?.toLowerCase() ?? "common";

        return RARITY_VALUE[rarity] ?? ZhenFTRarity.Common;
    }

    private static async _drawImage(
        context: SKRSContext2D,
        directory: string,
    ) {
        const [type, id] = directory.split("/", 2);
        const resolvedDirectory =
            id === undefined
                ? directory
                : `${type}/${this._resolvePartId(type as ZhenFTPartType, id)}`;
        let image = this.imageCache.get(resolvedDirectory);

        if (!image) {
            image = await loadImage(join(IMAGE_ROOT, `${resolvedDirectory}.png`));
            this.imageCache.set(resolvedDirectory, image);
        }

        context.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    public static async generateImage(
        color: string,
        accessory: string,
        body: string,
        face: string,
        head: string,
    ) {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const context = canvas.getContext("2d");

        context.fillStyle = color;
        context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        if (accessory !== "0") {
            await this._drawImage(context, `accessory/${accessory}`);
        }

        await this._drawImage(context, "base");

        if (body !== "0") {
            await this._drawImage(context, `body/${body}`);
        }

        if (face !== "0") {
            await this._drawImage(context, `face/${face}`);
        }

        if (head !== "0") {
            await this._drawImage(context, `head/${head}`);
        }

        return canvas;
    }
}
