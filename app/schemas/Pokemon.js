const mongoose = require("mongoose");
const T = require("app/schemas/Types");

// TODO: required fields
module.exports = mongoose.Schema(
  {
    nid: T.UniqueUint,
    name: T.UniqueString,
    type1: T.Type,
    type2: T.Type,
    hp: T.Stat,
    attack: T.Stat,
    defense: T.Stat,
    sp_attack: T.Stat,
    sp_defense: T.Stat,
    base_total: T.Uint,
    speed: T.Stat
  }
);