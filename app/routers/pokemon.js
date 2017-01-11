"use strict";

var express = require('express');
var router = express.Router();
var db = require("app/db");
var sPokemon = require("app/models/sqlite/pokemon");

router.get('/', function (req, res, next) {
  Promise.all([
    db.sqlite.all('SELECT * FROM pokemon')
  ])
    .then(function (data) {
      return res.send(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/:id', function (req, res, next) {
  new sPokemon(req.params.id).load()
    .then(function (data) {
      return res.send(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;