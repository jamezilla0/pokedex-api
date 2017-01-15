'use strict';

const sqlite = require("sqlite");
const mongoose = require("mongoose");
const Promise = require("bluebird");

mongoose.Promise = require('bluebird');

// BRING IN SCHEMAS & MODELS
require("app/models").register();

/**
 * @param dbName
 * @return {Promise}
 */
function dbConnect(dbName) {
  const mongodbURI = 'mongodb://mongodb:' + (process.env.MONGO_PORT || 27017) + '/' + dbName;

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', function () {
    console.info('Mongoose connected to ' + mongodbURI);
  });

  // If the connection throws an error
  mongoose.connection.on('error', function (e) {
    console.error('Mongoose connection error: ', e);
    process.exit(1);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function () {
    console.info('Mongoose connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.info('Mongoose connection disconnected through app termination');
      process.exit(0);
    });
  });

  return Promise.resolve()
    .then(function () {
      mongoose.connect(mongodbURI);
      return mongoose.connection;
    });
}

module.exports = {
  /**
   * @return {Promise}
   */
  connect: function (dbName) {
    return dbConnect(dbName)
      .then(function () {
        return new Promise(function (resolve, reject) {
          console.warn("Mongoose connection opened");
          var resolveOrReject = function () {
            try {
              resolve();
            } catch (e) {
              reject(e);
            }
          };
          mongoose.connection.once('open', resolveOrReject);
        });
      })
      .then(() => sqlite.open(process.env.SQLITE_DB, Promise))
      .then(() => mongoose.connection)
  }
};