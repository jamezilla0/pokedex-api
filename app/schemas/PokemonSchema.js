"use strict";

const mongoose = require("mongoose");
const T = require("app/schemas/types");

// TODO: required fields
module.exports = mongoose.Schema(
  {
    nnid: T.UniqueUint, // National number ID
    name: T.UniqueString,
    type_1: T.Type,
    type_2: T.Type,
    bs_total: T.Uint, // base stats total
    hp: T.Stat,
    attack: T.Stat,
    defense: T.Stat,
    sp_attack: T.Stat,
    sp_defense: T.Stat,
    speed: T.Stat,
    forms: [String] // tmp
  },
  {
    // _id: false, // only for sub-schemas
    versionKey: false,
    typeKey: "$type"
  }
);