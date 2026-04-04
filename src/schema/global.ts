import type { CollectionSchema } from "../class/mongoose.ts";

export enum CountingSettings {
    IsUserStrict = 1 << 0,
    IsNumberStrict = 1 << 1,
}

const schema: CollectionSchema = {
    table: "globals",
    columns: {
        counting: "counting",
        canvas: "canvas",
    },
};

export default schema;
