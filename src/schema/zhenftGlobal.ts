import { Schema } from "mongoose";

export default new Schema({
    _id: {
        type: String,
    },
    itemShop: {
        type: Object,
        default: {},
    },
});
