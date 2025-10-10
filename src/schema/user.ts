import { Schema } from 'mongoose'

export enum CountingSettings {
    IsUserStrict   = 1 << 0,
    IsNumberStrict = 1 << 1
}

export default new Schema({
    _id: {
        type: String
    },
    starboard: {
        tier1: {
            type: Number,
            min: 0,
            default: 0
        },
        tier2: {
            type: Number,
            min: 0,
            default: 0
        },
        tier3: {
            type: Number,
            min: 0,
            default: 0
        }
    }
});