"use strict";

const db = require("app/db");
const _ = require("lodash");
const Promise = require("bluebird");

/**
 * @param {Object} row
 * @returns {Promise}
 */
function completePokemonData(row) {
  return Promise.resolve(row)
    .then(function (data) {
      if (!data) {
        return findPokemon(isNaN(value) ? 'identifier' : 'id', value, false);
      }
      return findPokemon("is_default=1 AND species_id", data.id, false);
    })
    .then(function (data) {
      data.forms = {};
      return db.sqlite.all('SELECT * FROM pokemon_forms' +
        ' WHERE pokemon_id IN (SELECT id FROM pokemon WHERE species_id = ?)' +
        ' AND (form_identifier != "") AND (form_identifier IS NOT null) ' +
        ' ORDER BY form_order', data.species_id)
        .then(function (forms) {
          var formsPromises = [];
          _.each(forms, function (form) {
            if (form.pokemon_id != data.pokemon_id) {
              formsPromises.push(findPokemon('id', form.pokemon_id, true));
            } else {
              delete form.order;
              if (form.is_default) {
                data = _.extend({}, form, data);
              }
              data.forms[form.form_identifier ? form.form_identifier : "default"] = form;
            }
          });
          return Promise.all(formsPromises).then(function (forms) {
            _.each(forms, function (form) {
              delete form.order;
              data.forms[form.form_identifier ? form.form_identifier : "default"] = form;
            });
            return data;
          });
        });
    });
}

/**
 * @param {String} where
 * @param {String|int} value
 * @param {boolean} withForms
 * @returns {Promise}
 */
function findPokemon(where, value, withForms) {
  var id = null;
  withForms = withForms === undefined ? true : withForms;

  return new Promise(function (resolve, reject) {
    db.sqlite.get('SELECT * FROM pokemon WHERE ' + where + ' = ?', value)
      .then(function (data) {
        if (!data) {
          error.http404();
        }
        id = data.id;
        data.pokemon_id = data.id;
        return data;
      })
      .then(function (data) {
        return db.sqlite.get('SELECT * FROM pokemon_species WHERE id = ?', data.species_id)
          .then(function (species) {
            delete species.conquest_order;
            return _.extend({}, data, species);
          });
      })
      .then(function (data) {
        return db.sqlite.all('SELECT * FROM pokemon_types WHERE (pokemon_id = ?) ORDER BY slot', id)
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
        return db.sqlite.all('SELECT * FROM pokemon_stats WHERE pokemon_id = ?', id)
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
        return db.sqlite.all('SELECT * FROM pokemon_forms WHERE (pokemon_id = ?)' +
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
      .then(resolve, reject);
  });
}

module.exports = function (conn) {
  return new Promise(function (resolve, reject) {
    return db.sqlite.all('SELECT * FROM pokemon_species ORDER BY id')
      .then(function (rows) {
        if (!_.isArray(rows)) {
          return;
        }
        return Promise.all(_.map(rows, function (row) {
          return completePokemonData(row)
            .then(function (row) {
              console.log("Migrating Poke # " + row.id);
              return db.rethink.db('pokedex').table('pokemon').insert({
                'nid': row.id,
                'name': row.identifier,
                'type1': row.type_1,
                'type2': row.type_2,
                "base_hp": row.base_hp,
                "base_attack": row.base_attack,
                "base_defense": row.base_defense,
                "base_sp_attack": row.base_sp_attack,
                "base_sp_defense": row.base_sp_defense,
                "base_speed": row.base_speed,
                "base_total": row.base_total,
                "yield_hp": row.yield_hp,
                "yield_attack": row.yield_attack,
                "yield_defense": row.yield_defense,
                "yield_sp_attack": row.yield_sp_attack,
                "yield_sp_defense": row.yield_sp_defense,
                "yield_speed": row.yield_speed,
                "forms": _.map(row.forms, function (val, key) {
                  return key;
                })
              }).run(conn);
            });
        }));
      })
      .then(resolve, reject);
  })
};