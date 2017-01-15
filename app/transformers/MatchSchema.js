"use strict";

const mongoose = require("mongoose");
const _ = require("lodash");

function _is_obj_array(val) {
  return _.isArray(val) && (val.length > 0) && _is_obj(val[0]);
}

function _is_obj(val) {
  return _.isObject(val) && !('$type' in val);
}

function _apply_model(modelName, obj, sObj, level = 0, maxLevel = 10) {
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
        _is_obj(obj[k]) &&
        _is_obj(sObj[k])
      ) {
        newObj[k] = _apply_model(null, obj[k], sObj[k]);
      } else if (
        _is_obj_array(obj[k]) &&
        (_.isArray(sObj[k]) || (('$type' in sObj[k]) && _.isArray(sObj[k].$type)))
      ) {
        newObj[k] = [];
        _.each(obj[k], function (oobj) {
          newObj[k].push(_apply_model(null, oobj, ('$type' in sObj[k]) ? sObj[k].$type[0] : sObj[k][0]));
        });
      } else {
        newObj[k] = obj[k];
      }
    }
  });
  return newObj;
}

module.exports = {
  /**
   * Applies the model schema to the given object(s) recursively, so the properties are filtered
   * by only the ones matching the model schema, in the same order as defined.
   *
   * @param {Object|Array} data
   * @param {String} modelName
   * @param {boolean} detectArray
   * @return {Object}
   */
  'transform': function (data, modelName, detectArray = false) {
    if (detectArray && _.isArray(data)) {
      return _.map(data, function (obj) {
        return _apply_model(modelName, obj);
      });
    }
    return _apply_model(modelName, data);
  }
};