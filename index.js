'use strict';

const db = require("app/db");

// Serve app only if all DB connections were successful
db.connect('pokedex')
  .catch(err => console.error(err.stack))
  .finally(function () {
    const app = require("app/app");
    const port = process.env.NODE_PORT || 5000;
    return app.listen(port, function () {
      console.log('App listening on port ' + port);
    });
  });