"use strict";

const router = require('express').Router();
const models = require("app/models");
const modelName = 'Pokemon';

router.get('/', function (req, res, next) {
  return models.find(modelName, req, res, next, {sort: {nnid: 1}});
});

router.get('/:id', function (req, res, next) {
  return models.findOne(modelName, (isNaN(req.params.id) ? 'name' : 'nnid'), req.params.id, req, res, next);
});

module.exports = router;