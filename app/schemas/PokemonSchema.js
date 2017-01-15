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
    height: T.Uint,
    weight: T.Uint,
    gender: {
      male: T.Percent,
      female: T.Percent
    },
    color: T.Color,
    yield: T.Stats,
    base_happiness: T.Uint8,
    base_hatch_steps: T.Uint8,
    base_capture_rate: T.Uint8,
    base_experience: T.Uint, // no Uint8 ?
    growth_group: T.GrowthGroup,
    flags: {
      is_baby: Boolean,
      has_gender_differences: Boolean,
    },
    forms: [String] // tmp
  },
  {
    // _id: false, // only for sub-schemas
    versionKey: false,
    typeKey: "$type",
    retainKeyOrder: true,
    minimize: true
  }
);