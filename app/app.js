'use strict';

const express = require("express");
const app = express();
const _ = require("lodash");

// ROUTERS:
const routers = {
  "/pokemon": require("app/routers/PokemonRouter"),
  "/legacy/pokemon": require("app/routers/LegacyPokemonRouter")
};
// END ROUTERS.

app.get('/', function (req, res) {
  res.send({"message": "It Works!"});
});

if (process.env.NODE_ENV === 'development') {
  app.get('/routes/', function (req, res) {
    res.send(app._router.stack);
  });
}

// Register routers:
_.each(_.keys(routers), function (path) {
  app.use(path, routers[path]);
});

// Fallback middleware:
app.use(function (err, req, res, next) {
  if ('httpStatusCode' in err) {
    console.error('HttpError ' + err.httpStatusCode + ": " + err.message);
    res.status(err.httpStatusCode)
      .send({"error_code": err.httpStatusCode, "error_message": err.httpErrorMessage})
  } else {
    console.error(err);
    res.status(500)
      .send({"error_code": 500, "error_message": "Internal Server Error"})
  }
});

module.exports = app;