// @bun
var __require = import.meta.require;

// src/schema/user.ts
import { Schema } from "mongoose";
var CountingSettings;
((CountingSettings2) => {
  CountingSettings2[CountingSettings2.IsUserStrict = 1] = "IsUserStrict";
  CountingSettings2[CountingSettings2.IsNumberStrict = 2] = "IsNumberStrict";
})(CountingSettings ||= {});
var user_default = new Schema({
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
export {
  user_default as default,
  CountingSettings
};
