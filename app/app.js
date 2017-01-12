'use strict';

const express = require("express");
const app = express();

app.get('/', function (req, res) {
  res.send({"message": "It Works!"});
});

app.get('/routes/', function (req, res) {
  res.send(app._router.stack);
});

module.exports = app;