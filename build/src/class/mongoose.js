// @bun
var __require = import.meta.require;

// src/class/mongoose.ts
import mongoose from "mongoose";
mongoose.connect(process.env?.MONGODB_URI, {
  compressors: [
    "zstd",
    "snappy",
    "zlib"
  ],
  useBigInt64: !0
}).then(() => {
  return;
});

class Model {
  schema;
  model;
  constructor(collectionName, schema) {
    this.schema = schema, this.model = mongoose.model(collectionName, schema);
  }
  create(data, options) {
    return this.model.create(data, options);
  }
  delete(id, options) {
    return this.model.deleteMany(id, options);
  }
  async exists(id) {
    return !!await this.model.findOne({ _id: id }).select("_id").lean();
  }
  fetch(id, filter, options) {
    return this.model.findById(id, filter, options);
  }
  find(id, filter, options) {
    return this.model.find({ _id: id }, filter, options);
  }
  findAll(filter, options) {
    return this.model.find(filter, options);
  }
  findOne(id, filter, options) {
    return this.model.findOne(id, filter, options);
  }
  update(id, data) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { upsert: !0 });
  }
}
export {
  Model as default
};
