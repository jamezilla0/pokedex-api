"use strict";

const router = require('express').Router();
const errors = require("app/errors");
const models = require("app/models");
const modelName = 'Pokemon';
const model = models.get(modelName);
const JsonApiHelper = new require("app/helpers/JsonApiHelper");

router.get('/', function (req, res, next) {
  var jj = new JsonApiHelper(req, modelName);

  model.count(jj.filter()) // find total results first
    .then(function (totalResults) {
      return model.find(
        jj.filter(),
        jj.pick(),
        jj.options({sort: {nnid: 1}}) // By default sort by national number id, ASC
      )
        .then(data => res.send(jj.response(data ? data : [], totalResults)))
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

router.get('/:id', function (req, res, next) {
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