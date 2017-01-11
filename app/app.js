'use strict';

const express = require("express");
const app = express();

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500)
    .send({"error_code": 500, "error_message": "Internal Server Error"})
});

app.get('/', function (req, res) {
  res.send({"message": "It Works!"});
});

app.get('/routes/', function (req, res) {
  res.send(app._router.stack);
});

module.exports = app;