"use strict";

const express = require('express');
const router = express.Router();
const PokemonSpecies = require("app/legacy/PokemonSpeciesModel");

router.get('/', function (req, res, next) {
  PokemonSpecies.all()
    .then(function (data) {
      return res.send(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/:id', function (req, res, next) {
  PokemonSpecies.findBy(isNaN(req.params.id) ? 'identifier' : 'id', req.params.id)
    .then(function (data) {
      return res.send(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;