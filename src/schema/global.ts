import { Schema } from 'mongoose'

export enum CountingSettings {
    IsUserStrict   = 1 << 0,
    IsNumberStrict = 1 << 1
}

export default new Schema({
    _id: {
        type: String
    },
    counting: {
        value: {
            type: Number,
            min: 0,
            default: 0
        },
        lastUser: {
            type: String,
            default: null
        },
        lastTime: {
            type: Date,
            default: null
        },
        settings: {
            type: Number,
            min: 0,
            default: 0
        },
        type: Object,
        default: null
    },
    canvas: {
        data: {
        	type: Object,
        	default: {}
        },
        size: {
            type: Number,
            min: 0,
            default: 0
        }
    }
});