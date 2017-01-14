const mongoose = require("mongoose");

/**
 * @param {String} modelName
 * @return {*|Model|Aggregate}
 */
module.exports = function (modelName) {
  "use strict";
  return mongoose.model(modelName);
};