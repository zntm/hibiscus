import type { CollectionSchema } from "../class/mongoose.ts";

const schema: CollectionSchema = {
    table: "users",
    columns: {
        starboard: "starboard",
    },
};

export default schema;
