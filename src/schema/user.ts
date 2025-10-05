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
        copper: {
            type: Number,
            min: 0,
            default: 0
        },
        iron: {
            type: Number,
            min: 0,
            default: 0
        },
        gold: {
            type: Number,
            min: 0,
            default: 0
        },
        platinum: {
            type: Number,
            min: 0,
            default: 0
        }
    }
});