'use strict';

const db = require("app/db");
const Promise = require("bluebird");
const migrate_pokemon = require("migration/collections/pokemon");

// Serve app only if all DB connections were successful
db.connect('pokedex')
  .then(mongodb => mongodb.dropDatabase(null))
  .then(function () {
    // MIGRATIONS GO HERE
    return Promise.all([
      migrate_pokemon()
    ]);
  })
  .then(() => console.info("Pokedex migrated!! =)"))
  .catch(function (err) {
    console.error(err.stack);
    process.exit(1);
  })
  .finally(function () {
    process.exit(0);
  });