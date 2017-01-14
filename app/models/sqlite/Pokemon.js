"use strict";

const db = require("app/db").sqlite;
const _ = require("lodash");
const error = require("app/errors");

/**
 * @returns {Promise}
 */
function _all() {
  return new Promise(function (resolve, reject) {
    return db.sqlite.all('SELECT * FROM pokemon WHERE ORDER BY id').then(resolve, reject);
  });
}

/**
 * @param {String} where
 * @param {String|int} value
 * @param {boolean} withForms
 * @returns {Promise}
 */
function _findBy(where, value, withForms) {
  var id = null;
  withForms = withForms === undefined ? true : withForms;

  return new Promise(function (resolve, reject) {
    db.get('SELECT * FROM pokemon WHERE ' + where + ' = ?', value)
      .then(function (data) {
        if (!data) {
          error.http404();
        }
        id = data.id;
        data.pokemon_id = data.id;
        return data;
      })
      .then(function (data) {
        return db.get('SELECT * FROM pokemon_species WHERE id = ?', data.species_id)
          .then(function (species) {
            delete species.conquest_order;
            return _.extend({}, data, species);
          });
      })
      .then(function (data) {
        return db.all('SELECT * FROM pokemon_types WHERE (pokemon_id = ?) ORDER BY slot', id)
          .then(function (types) {
            if (!types || !types.length) {
              data['type_1'] = null;
              data['type_2'] = null;
              return data;
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
              data["type_" + type.slot] = typeNames[type.type_id - 1];
            });

            if (!('type_2' in data)) {
              data['type_2'] = null;
            }
            return data;
          });
      })
      .then(function (data) {
        return db.all('SELECT * FROM pokemon_stats WHERE pokemon_id = ?', id)
          .then(function (stats) {
            if (!stats || !stats.length) {
              return data;
            }
            var statNames = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
            var baseStatTotal = 0;
            _.each(stats, function (stat) {
              data["base_" + statNames[stat.stat_id - 1]] = parseInt(stat.base_stat);
              baseStatTotal += parseInt(stat.base_stat);
            });

            data["base_total"] = baseStatTotal;

            _.each(stats, function (stat) {
              data["yield_" + statNames[stat.stat_id - 1]] = parseInt(stat.effort);
            });
            return data;
          });
      })
      .then(function (data) {
        if (!withForms) {
          return data;
        }
        data['forms'] = {};
        return db.all('SELECT * FROM pokemon_forms WHERE (pokemon_id = ?)' +
          ' AND (form_identifier != "") AND (form_identifier IS NOT null) ' +
          ' ORDER BY form_order', id)
          .then(function (forms) {
            _.each(forms, function (form) {
              delete form.order;
              if ((form.pokemon_id = data.pokemon_id) && form.is_default) {
                data = _.extend({}, form, data);
              } else {
                data['forms'][form.form_identifier ? form.form_identifier : "default"] = form;
              }
            });
            return data;
          });
      })
      .then(resolve, reject)
      .catch(function (err) {
        return next(err);
      });
  });
}

module.exports = {
  "findBy": _findBy,
  "all": _all
};