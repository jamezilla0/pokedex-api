const mongoose = require("mongoose");
const schemas = require("app/schemas");

module.exports = {
  Pokemon: mongoose.model('Pokemon', schemas.Pokemon, 'pokemon')
};