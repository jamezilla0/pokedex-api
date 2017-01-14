'use strict';

const db = require("app/db");
const Promise = require("bluebird");
var migrate_pokemon = require("migration/migrators/pokemon");

// Serve app only if all DB connections were successful
Promise.resolve()
  .then(function () {
    return db.sqlite.open(process.env.SQLITE_DB, Promise);
  })
  .then(function () {
    return db.mongo.once('open', Promise);
  })
  .then(function () {
    return db.mongo.dropDatabase(null);
  })
  .then(function () {
    // MIGRATIONS GO HERE
    return Promise.all([
      migrate_pokemon()
    ]);
  })
  .then(function () {
    console.info("Pokedex migrated!! =)");
  })
  .catch(function (err) {
    console.error(err.stack);
    process.exit(1);
  })
  .finally(function () {
    process.exit(0);
  });