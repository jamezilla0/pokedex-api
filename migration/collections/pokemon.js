"use strict";

const _ = require("lodash");
const Promise = require("app/core/Promise");
const models = require("app/models");
const VkPokeFinder = require("migration/finders/veekun/PokemonFinder");
const modelName = 'Pokemon';

function _transformSingle(row) {
  return new models.get(modelName)({
    nnid: row.id,
    name: row.identifier,
    type_1: row.type_1,
    type_2: row.type_2,
    stats: {
      hp: row.base_hp,
      attack: row.base_attack,
      defense: row.base_defense,
      sp_attack: row.base_sp_attack,
      sp_defense: row.base_sp_defense,
      speed: row.base_speed,
      total: row.base_total,
    },
    height: row.height ? parseInt(row.height) : null,
    weight: row.weight ? parseInt(row.weight) : null,
    gender: row.gender,
    color: row.color,
    yield: {
      hp: row.yield_hp,
      attack: row.yield_attack,
      defense: row.yield_defense,
      sp_attack: row.yield_sp_attack,
      sp_defense: row.yield_sp_defense,
      speed: row.yield_speed,
      total: row.yield_total,
    },
    base_happiness: row.base_happiness ? parseInt(row.base_happiness) : null,
    base_hatch_steps: row.hatch_counter ? parseInt(row.hatch_counter) : null,
    base_capture_rate: row.capture_rate ? parseInt(row.capture_rate) : null,
    base_experience: row.base_experience ? parseInt(row.base_experience) : null,
    growth_group: row.growth_group,
    flags: {
      is_baby: row.is_baby ? true : false,
      has_gender_differences: row.has_gender_differences ? true : false,
    },
    forms: _.map(row.forms, function (val, key) {
      return key;
    })
  });
}

function _transformAll() {
  return VkPokeFinder.findSpecies()
    .then(rows => {
      return Promise.all(_.map(rows, function (row) {
        return _transformSingle(row);
      }));
    });
}

module.exports = {
  transform: _transformAll,
  migrate: function () {
    return _transformAll()
      .then(docs => {
        return Promise.all(_.map(docs, function (doc) {
          console.log("Migrating Poke # " + doc.nnid);
          // Insert into mongodb
          return doc.save();
        }));
      });
  }
};