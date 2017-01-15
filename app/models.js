"use strict";

const mongoose = require("mongoose");
const _ = require("lodash");
const tr = {
  apiParams: require("app/transformers/ApiParams"),
  apiResponse: require("app/transformers/ApiResponse"),
  matchSchema: require("app/transformers/MatchSchema"),
};
const Promise = require("app/core/Promise");
const errors = require("app/errors");

function _find_options(params, defaultOptions = {}) {
  var p = params.parsed.page;
  // console.log(params.parsed.sort);
  return _.defaults(params.parsed.sort, {
    skip: ((p.number - 1) * p.size),
    limit: p.size
  }, defaultOptions);
}

var _special_filters = {
  'Pokemon': function (filter) {
    if ('type' in filter) {
      var $and = ('$and' in filter) ? filter.$and : [];
      $and.push({$or: [{type_1: filter.type}, {type_2: filter.type}]});
      delete filter.type;
      filter.$and = $and;
    }
    return filter;
  }
};

module.exports = (function () {
  return {
    /**
     * @param {String} modelName
     * @return {Model|*|Aggregate}
     */
    get: function (modelName) {
      return mongoose.model(modelName);
    },
    /**
     * Registers all models
     */
    register: function () {
      const schemas = require("app/schemas");
      mongoose.model('Pokemon', schemas.Pokemon, 'pokemon');
    },
    find: function (modelName, req, res, next, defaultOptions = {sort: {name: 1}}) {
      const model = mongoose.model(modelName);
      return Promise.resolve(tr.apiParams.parse(req))
        .then(apiParams => {
          if (modelName in _special_filters) {
            apiParams.parsed.filter = _special_filters[modelName](apiParams.parsed.filter);
          }
          return apiParams;
        })
        .then(apiParams => {
          return Promise.promisifyAll([apiParams, model.count(apiParams.parsed.filter)]);
        })
        .spread((apiParams, totalResults) => {
          var searchCriteria = {
            filter: apiParams.parsed.filter,
            pick: apiParams.parsed.pick,
            options: _find_options(apiParams, defaultOptions) // pagination and sorting
          };

          //console.info(searchCriteria);

          var finder = model.find(
            searchCriteria.filter,
            searchCriteria.pick,
            searchCriteria.options
          );
          return [apiParams, finder, totalResults];
        })
        .spread((apiParams, results, totalResults) => {
          results = tr.matchSchema.transform(results ? results : [], modelName, true);
          return [apiParams, results ? results : [], totalResults];
        })
        .spread((apiParams, results, totalResults) => {
          return tr.apiResponse.transform(results, totalResults, apiParams, req);
        })
        .then(responseBody => {
          return tr.apiResponse.send(responseBody, res);
        })
        .catch(err => next(err));
    },
    findOne: function (modelName, primaryKeyField, primaryKeyValue, req, res, next) {
      const model = mongoose.model(modelName);
      req.query.f = null;
      req.query.p = null;
      return Promise.resolve(tr.apiParams.parse(req))
        .then(apiParams => {
          var filter = {};
          filter[primaryKeyField] = primaryKeyValue;
          var finder = model.findOne(filter, apiParams.parsed.pick, {});
          return [apiParams, finder, null];
        })
        .spread((apiParams, results, totalResults) => {
          if (!results) {
            errors.http404();
          }
          results = tr.matchSchema.transform(results ? results : [], modelName, false);
          return [apiParams, results, totalResults];
        })
        .spread((apiParams, results, totalResults) => {
          return tr.apiResponse.transform(results, totalResults, apiParams, req);
        })
        .then(responseBody => {
          return tr.apiResponse.send(responseBody, res);
        })
        .catch(err => next(err));
    }
  };
})();