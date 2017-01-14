'use strict';

const sqlite = require("sqlite");
const rethink = require('rethinkdb');
const mongoose = require("mongoose");

mongoose.connect('mongodb://mongodb:' + process.env.MONGO_PORT + '/pokedex');
const mongo = mongoose.connection;
mongo.on('error', console.error.bind(console, 'MongoDB error:'));

module.exports = {
  "rethink": rethink,
  "sqlite": sqlite,
  "mongo": mongo,
  "mongoose": mongoose
};