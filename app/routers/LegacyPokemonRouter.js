"use strict";

const express = require('express');
const router = express.Router();
const VkPokeFinder = require("migration/finders/veekun/PokemonFinder");

router.get('/', function (req, res, next) {
  VkPokeFinder.find(false, false)
    .then(function (data) {
      return res.send(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

router.get('/:id', function (req, res, next) {
  VkPokeFinder.findBy(isNaN(req.params.id) ? 'identifier' : 'id', req.params.id, true)
    .then(function (data) {
      return res.send(data);
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = router;