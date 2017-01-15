"use strict";

const router = require('express').Router();
const errors = require("app/errors");
const models = require("app/models");
const modelName = 'Pokemon';

router.get('/', function (req, res, next) {
  return models.find(modelName, req, res, next);
});

router.get('/:id', function (req, res, next) {
  const model = models.get(modelName);
  const JsonApiHelper = new require("app/helpers/JsonApiHelper");
  var jj = new JsonApiHelper(req, modelName);
  var filter = {};
  filter[(isNaN(req.params.id) ? 'name' : 'nnid')] = req.params.id;

  model.findOne(
    jj.filter(filter),
    jj.pick()
  )
    .then(function (data) {
      if (!data) {
        errors.http404();
      }
      return res.send(jj.response(data));
    });
});

module.exports = router;