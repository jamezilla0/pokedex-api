"use strict";

var db = require("app/db");
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
      db.sqlite.get('SELECT * FROM pokemon WHERE id = ?', me.getId()),
      db.sqlite.get('SELECT * FROM pokemon_species WHERE id = ?', me.getId())
    ])
      .then(function (data) {
        if (!data[0]) {
          throw new Error("Pokemon not found: " + me.getId());
        }
        return _.extend.apply(null, data);
      })
      .then(function (data) {
        return db.sqlite.all('SELECT * FROM pokemon_stats WHERE pokemon_id = ?', me.getId())
          .then(function (stats) {
            data.stats = stats;
            return data;
          });
      })
      .then(function (data) {
        me.data = data;
        return data;
      })
      .then(resolve, reject)
      .catch(function (err) {
        return next(err);
      });
  });
};

module.exports = Pokemon;