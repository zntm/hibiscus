import type { CollectionSchema } from "../class/mongoose.ts";

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

const schema: CollectionSchema = {
    table: "zhenft_users",
    columns: {
        library: "library",
        libraryMaxIncrement: "library_max_increment",
    token: "token",
    tokenMaxIncrement: "token_max_increment",
    tokenTotal: "token_total",
    collectionTotal: "collection_total",
    dailyStreak: "daily_streak",
    effects: "effects",
    items: "items",
        badges: "badges",
        timeStart: "time_start",
    },
};

export default schema;
