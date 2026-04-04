import { Schema } from "mongoose";

export enum BaseValue {
    PriceGeneration = 1_000,

    LibraryMax = 15,

    TokenInit = 5_000,
    TokenMax = 25_000,

    DailyTokenMin = 1_500,
    DailyTokenMax = 2_500,
    DailyStreakMax = 5,

    IDLengthMin = 8,
    IDLengthMax = 14,
}

export default new Schema({
    _id: {
        type: String,
    },
    library: {
        type: Object,
        default: {},
    },
    libraryMaxIncrement: {
        type: Number,
        min: 0,
        default: 0,
    },
    token: {
        type: Number,
        min: 0,
        default: 0,
    },
    tokenMaxIncrement: {
        type: Number,
        min: 0,
        default: 0,
    },
    tokenTotal: {
        type: Number,
        min: 0,
        default: 0,
    },
    dailyStreak: {
        amount: {
            type: Number,
            min: 0,
            default: 0,
        },
        lastClaimed: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    effects: {
        type: Object,
        default: {},
    },
    items: {
        inventory: {
            type: Object,
            default: {},
        },
        active: {
            type: Object,
            default: {},
        },
    },
    badges: {
        type: Object,
        default: {},
    },
    timeStart: {
        type: Number,
        default: 0,
    },
});
