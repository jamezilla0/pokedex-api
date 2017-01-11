"use strict";

var db = require("app/db").sqlite;
var _ = require("underscore");

/**
 * @param {int} id
 * @constructor
 */
var Pokemon = function (id) {
  this._id = id;
  this.data = null;
};

/**
 * @returns {int}
 */
Pokemon.prototype.getId = function () {
  return this._id;
};

/**
 * @returns {Object|null}
 */
Pokemon.prototype.getData = function () {
  return this.data;
};

/**
 * @returns {Promise}
 */
Pokemon.prototype.load = function () {
  var me = this;

  return new Promise(function (resolve, reject) {
    Promise.all([
      db.get('SELECT * FROM pokemon WHERE id = ?', me.getId()),
      db.get('SELECT * FROM pokemon_species WHERE id = ?', me.getId())
    ])
      .then(function (data) {
        if (!data[0]) {
          throw new Error("Pokemon not found: " + me.getId());
        }
        return _.extend.apply(null, data);
      })
      .then(function (pkm) {
        return db.all('SELECT * FROM pokemon_types WHERE pokemon_id = ? ORDER BY slot', me.getId())
          .then(function (types) {
            if (!types || !types.length) {
              pkm['type_1'] = null;
              pkm['type_2'] = null;
              return pkm;
            }
            var typeNames = [
              'normal',
              'fighting',
              'flying',
              'poison',
              'ground',
              'rock',
              'bug',
              'ghost',
              'steel',
              'fire',
              'water',
              'grass',
              'electric',
              'psychic',
              'ice',
              'dragon',
              'dark',
              'fairy'
            ];

            _.each(types, function (type) {
              pkm["type_" + type.slot] = typeNames[type.type_id - 1];
            });

            if (!('type_2' in pkm)) {
              pkm['type_2'] = null;
            }
            return pkm;
          });
      })
      .then(function (pkm) {
        return db.all('SELECT * FROM pokemon_stats WHERE pokemon_id = ?', me.getId())
          .then(function (stats) {
            if (!stats || !stats.length) {
              return pkm;
            }
            var statNames = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
            var baseStatTotal = 0;
            _.each(stats, function (stat) {
              pkm["base_" + statNames[stat.stat_id - 1]] = parseInt(stat.base_stat);
              baseStatTotal += parseInt(stat.base_stat);
            });

            pkm["base_total"] = baseStatTotal;

            _.each(stats, function (stat) {
              pkm["yield_" + statNames[stat.stat_id - 1]] = parseInt(stat.effort);
            });
            return pkm;
          });
      })
      .then(function (pkm) {
        me.data = pkm;
        return pkm;
      })
      .then(resolve, reject)
      .catch(function (err) {
        return next(err);
      });
  });
};

module.exports = Pokemon;