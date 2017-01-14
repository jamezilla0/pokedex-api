'use strict';

const sqlite = require("sqlite");
const rethink = require('rethinkdb');
const mongoose = require("mongoose");
const mongodbURI = 'mongodb://mongodb:' + (process.env.MONGO_PORT || 27017) + '/pokedex';

mongoose.Promise = require('bluebird');
mongoose.connect(mongodbURI);

// CONNECTION EVENTS

// When successfully connected
mongoose.connection.on('connected', function () {
  console.info('Mongoose default connection open to ' + mongodbURI);
});

// If the connection throws an error
mongoose.connection.on('error', console.error.bind(console, 'MongoDB error:'));

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// BRING IN SCHEMAS & MODELS
require("app/models");

module.exports = {
  "rethink": rethink,
  "sqlite": sqlite,
  "mongo": mongoose.connection
};