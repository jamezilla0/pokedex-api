'use strict';

const app = require("app");
const port = process.env.NODE_PORT || 5000;
const db = require("app/db");
const Promise = require("bluebird");

// Serve app only if all DB connections were successful
Promise.resolve()
  .then(function () {
    return db.sqlite.open('./docker/data/db/pokedex.sqlite', Promise);
  })
  .then(function () {
    return db.mongo.once('open', Promise);
  })
  .then(function () {
    return db.rethink.connect({host: 'rethinkdb', port: 28015});
  })
  .catch(function (err) {
    return console.error(err.stack);
  })
  .finally(function () {
    return app.listen(port, function () {
      console.log('App listening on port ' + port);
    });
  });