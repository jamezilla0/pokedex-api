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
    stats: T.Stats,
    ev_yield: T.Stats,
    forms: [String] // tmp
  },
  {
    // _id: false, // only for sub-schemas
    versionKey: false,
    typeKey: "$type"
  }
);