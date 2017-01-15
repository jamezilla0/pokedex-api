"use strict";

const mongoose = require("mongoose");
const _ = require("lodash");

module.exports = (function () {
  function isObjectArray(val) {
    return _.isArray(val) && (val.length > 0) && isObject(val[0]);
  }

  function isObject(val) {
    return _.isObject(val) && !('$type' in val);
  }

  function applyModel(modelName, obj, sObj, level = 0, maxLevel = 10) {
    var newObj = {};
    level++;
    sObj = sObj || (modelName ? mongoose.model(modelName).schema.obj : {});

    _.each(_.keys(sObj), function (k) {
      if (level >= maxLevel) {
        if (k in obj) {
          newObj[k] = obj[k];
        }
      } else if (k in obj) {
        if (
          !_.isArray(obj[k]) &&
          isObject(obj[k]) &&
          isObject(sObj[k])
        ) {
          newObj[k] = applyModel(null, obj[k], sObj[k]);
        } else if (
          isObjectArray(obj[k]) &&
          (_.isArray(sObj[k]) || (('$type' in sObj[k]) && _.isArray(sObj[k].$type)))
        ) {
          newObj[k] = [];
          _.each(obj[k], function (oobj) {
            newObj[k].push(applyModel(null, oobj, ('$type' in sObj[k]) ? sObj[k].$type[0] : sObj[k][0]));
          });
        } else {
          newObj[k] = obj[k];
        }
      }
    });
    return newObj;
  }

  return {
    /**
     * @param {String} modelName
     * @return {Model|*|Aggregate}
     */
    get: function (modelName) {
      return mongoose.model(modelName);
    },
    /**
     * Applies the model schema to the given object(s) recursively, so the properties are filtered
     * by only the ones matching the model schema, in the same order as defined.
     *
     * @param {Object|Array} data
     * @param {String} modelName
     * @return {Object}
     */
    transform: function (data, modelName) {
      if (_.isArray(data)) {
        return _.map(data, function (obj) {
          return applyModel(modelName, obj);
        });
      }
      return applyModel(modelName, data);
    },
    /**
     * Registers all models
     */
    register: function () {
      const schemas = require("app/schemas");
      mongoose.model('Pokemon', schemas.Pokemon, 'pokemon');
    }
  };
})();