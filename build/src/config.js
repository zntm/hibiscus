// @bun
var __require = import.meta.require;

// src/config.json
var channel = {
  article: "1405113390539477113",
  counting: "1424029576136228874",
  starboard: "1405795253574701126",
  welcome: "1424026527007244378"
}, role = {
  articleWriter: [],
  booster: "860758781872439317"
}, config_default = {
  channel,
  role
};
export {
  role,
  config_default as default,
  channel
};
