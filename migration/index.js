'use strict';

const app = require("app");
const db = require("app/db");
const Promise = require("bluebird");

// Serve app only if all DB connections were successful
Promise.resolve()
  .then(function () {
    return db.sqlite.open('./docker/data/db/pokedex.sqlite', Promise);
  })
  .then(function () {
    return db.rethink.connect({host: 'rethinkdb', port: 28015});
  })
  .catch(function (err) {
    console.error(err.stack);
    process.exit(1);
  })
  .finally(function () {
    try {
      console.info("Migrated!");
      process.exit(0);
    } catch (e) {
      console.error(e.stack);
      process.exit(1);
    }
  });