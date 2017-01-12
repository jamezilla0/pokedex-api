"use strict";

const db = require("app/db").sqlite;
const _ = require("underscore");
const Pokemon = require("./Pokemon");
const Promise = require("bluebird");
const error = require("app/errors");

/**
 * @returns {Promise}
 */
function _all() {
  return new Promise(function (resolve, reject) {
    return db.sqlite.all('SELECT * FROM pokemon_species WHERE ORDER BY id').then(resolve, reject);
  });
}

/**
 * @param {String} where
 * @param {String|int} value
 * @returns {Promise}
 */
function _findBy(where, value) {
  return new Promise(function (resolve, reject) {
    db.get('SELECT * FROM pokemon_species WHERE ' + where + ' = ?', value)
      .then(function (data) {
        if (!data) {
          return Pokemon.findBy(isNaN(value) ? 'identifier' : 'id', value, false);
        }
        return Pokemon.findBy("is_default=1 AND species_id", data.id, false);
      })
      .then(function (data) {
        data.forms = {};
        return db.all('SELECT * FROM pokemon_forms' +
          ' WHERE pokemon_id IN (SELECT id FROM pokemon WHERE species_id = ?)' +
          ' AND (form_identifier != "") AND (form_identifier IS NOT null) ' +
          ' ORDER BY form_order', data.species_id)
          .then(function (forms) {
            var formsPromises = [];
            _.each(forms, function (form) {
              if (form.pokemon_id != data.pokemon_id) {
                formsPromises.push(Pokemon.findBy('id', form.pokemon_id, true));
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