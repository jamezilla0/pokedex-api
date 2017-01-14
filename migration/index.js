'use strict';

const db = require("app/db");
const r = db.rethink;
const Promise = require("bluebird");
const _ = require("lodash");
var r_conn = null;
var migratePokemon = require("migration/migrators/pokemon");

// Serve app only if all DB connections were successful
Promise.resolve()
  .then(function () {
    return db.sqlite.open('./docker/data/db/pokedex.sqlite', Promise);
  })
  .then(function () {
    return r.connect({host: 'rethinkdb', port: 28015});
  })
  .then(function (conn) {
    var dbName = 'pokedex';
    r_conn = conn;

    return r.dbList().contains(dbName).run(conn)
      .then(function (contains) {
        if (contains === true) {
          return r.dbDrop(dbName).run(conn).then(function () {
            return r.dbCreate(dbName).run(conn);
          });
        } else {
          return r.dbCreate(dbName).run(conn);
        }
      });
  })
  .then(function () {
    var dbName = 'pokedex';
    var tablesToCreate = [
      'pokemon', 'moves', 'abilities', 'items',
      'languages', 'regions', 'locations', 'generations',
      'games', 'game_groups'
    ];
    return Promise.all(
      _.map(tablesToCreate, function (tableName) {
        return r.db(dbName).tableCreate(tableName, {primaryKey: 'name'}).run(r_conn);
      })
    );
  })
  .then(function () {
    return Promise.all([
      migratePokemon(r_conn)
    ])
      .then(function () {
        console.info("Migrated !!!");
      });
  })
  .catch(function (err) {
    console.error(err.stack);
    process.exit(1);
  })
  .finally(function () {
    process.exit(0);
  });