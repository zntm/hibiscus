import type { CollectionSchema } from "../class/mongoose.ts";

const schema: CollectionSchema = {
    table: "zhenft_globals",
    columns: {
        itemShop: "item_shop",
    },
};

export default schema;
