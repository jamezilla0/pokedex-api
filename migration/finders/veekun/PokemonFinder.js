"use strict";

const sqlite = require("sqlite");
const _ = require("lodash");
const Promise = require("app/core/Promise");
const models = require("app/models");
const errors = require("app/errors");

/**
 * @param {String|int} id
 * @param {String} idSource
 * @param {boolean} withForms
 * @returns {Promise}
 */
function _injectPokemonData(id, idSource = 'pokemon_species', withForms = true) {
  return Promise.resolve(idSource)
    .then(function (idSource) {
      if (idSource == 'pokemon_species') {
        return _findPokemon("species_id=" + id, false);
      } else {
        return _findPokemon((isNaN(id) ? 'identifier="' + id.replace(/"/g, '') + '"' : 'id=' + id), false);
      }
    })
    .then(function (data) {
      data.forms = {};
      if (!withForms) {
        return data;
      }
      return sqlite.all('SELECT * FROM pokemon_forms' +
        ' WHERE pokemon_id IN (SELECT id FROM pokemon WHERE species_id = ?)' +
        ' AND (form_identifier != "") AND (form_identifier IS NOT null) ' +
        ' ORDER BY form_order', data.species_id)
        .then(function (forms) {
          var formsPromises = [];
          _.each(forms, function (form) {
            if (form.pokemon_id != data.pokemon_id) {
              formsPromises.push(_findPokemon('id', form.pokemon_id, true));
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
 * @param {boolean} withForms
 * @returns {Promise}
 */
function _findPokemon(where, withForms = true) {
  var id = null;
  withForms = withForms === undefined ? true : withForms;
  where = where ? 'WHERE ' + where : '';

  return new Promise(function (resolve, reject) {
    sqlite.get('SELECT * FROM pokemon ' + where)
      .then(function (data) {
        if (!data) {
          console.error('Not Found: SELECT * FROM pokemon ' + where);
          errors.http404();
        }
        id = data.id;
        data.pokemon_id = data.id;
        return data;
      })
      .then(function (data) {
        return sqlite.get('SELECT * FROM pokemon_species WHERE id = ?', data.species_id)
          .then(function (species) {
            delete species.conquest_order;
            return _.extend({}, data, species);
          });
      })
      .then(function (data) {
        return sqlite.all('SELECT * FROM pokemon_types WHERE (pokemon_id = ?) ORDER BY slot', id)
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
        if (!_.isNumber(data.color_id)) {
          return data;
        }
        return sqlite.get('SELECT * FROM pokemon_colors WHERE id=?', data.color_id)
          .then(function (color) {
            data.color = color.identifier;
            return data;
          });
      })
      .then(function (data) {
        if (!_.isNumber(data.growth_rate_id)) {
          return data;
        }
        return sqlite.get('SELECT * FROM growth_rates WHERE id=?', data.growth_rate_id)
          .then(function (rate) {
            var rates = {
              "slow": "slow",
              "medium": "medium_fast",
              "fast": "fast",
              "medium_slow": "medium_slow",
              "slow_then_very_fast": "erratic",
              "fast_then_very_slow": "fluctuating"
            }, rate = rate.identifier.replace(/-/g, '_');

            if (rate in rates) {
              data.growth_group = rates[rate];
            }
            return data;
          });
      })
      .then(function (data) {
        if (!_.isNumber(data.gender_rate)) {
          // no data
          return data;
        }

        data.gender = {
          male: 0,
          female: 0
        };

        if (!_.isNumber(data.gender_rate) || data.gender_rate === -1) {
          return data;
        }

        var multiplier = 12.5, levels = 8, rate = parseInt(data.gender_rate);
        data.gender.male = (levels - rate) * multiplier;
        data.gender.female = rate * multiplier;
        return data;

      })
      .then(function (data) {
        return sqlite.all('SELECT * FROM pokemon_stats WHERE pokemon_id = ?', id)
          .then(function (stats) {
            if (!stats || !stats.length) {
              return data;
            }
            var statNames = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
            var baseStatTotal = 0, yieldTotal = 0;
            _.each(stats, function (stat) {
              data["base_" + statNames[stat.stat_id - 1]] = parseInt(stat.base_stat);
              baseStatTotal += parseInt(stat.base_stat);
            });

            data["base_total"] = baseStatTotal;

            _.each(stats, function (stat) {
              yieldTotal += parseInt(stat.effort);
              data["yield_" + statNames[stat.stat_id - 1]] = parseInt(stat.effort);
            });

            data["yield_total"] = yieldTotal;
            return data;
          });
      })
      .then(function (data) {
        data['forms'] = {};
        if (!withForms) {
          return data;
        }
        return sqlite.all('SELECT * FROM pokemon_forms WHERE (pokemon_id = ?)' +
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


module.exports = {
  find: function (where = '', withForms = false) {
    return new Promise(function (resolve, reject) {
      return sqlite.all('SELECT id FROM pokemon ' + where + ' ORDER BY id')
        .then(function (rows) {
          if (!_.isArray(rows)) {
            return [];
          }
          return Promise.all(_.map(rows, function (row) {
            return _injectPokemonData(row.id, 'pokemon', withForms);
          }));
        })
        .then(resolve, reject);
    })
  },
  findSpecies: function (where = '', withForms = false) {
    return new Promise(function (resolve, reject) {
      return sqlite.all('SELECT id FROM pokemon_species ' + where + ' ORDER BY id')
        .then(function (rows) {
          if (!_.isArray(rows)) {
            return [];
          }
          return Promise.all(_.map(rows, function (row) {
            return _injectPokemonData(row.id, 'pokemon_species', withForms);
          }));
        })
        .then(resolve, reject);
    })
  },
  findBy: function (column, value, withForms) {
    return _findPokemon(column + '=' + value + " LIMIT 1", withForms);
  },
  injectPokemonData: _injectPokemonData
};