"use strict";

const _ = require("lodash");
const models = require("app/models");
const qs = require('qs');

/*
 Pseudo JSON-API compilant helper
 */
class JsonApiHelper {
  constructor(req, modelName, defaults = {}) {
    this.defaults = _.defaults(defaults, {
      maxPageSize: 100,
      defaultPageSize: 24,
      maxSortCriteria: 5,
      maxFilters: 5,
      maxNesting: 5
    });

    this.req = req;

    var url = req.originalUrl.split('?', 2);
    this.url = {
      path: url[0],
      query: url[1] !== undefined ? url[1] : '',
      full: req.protocol + '://' + req.get('host') + url[0]
    };

    this.modelName = modelName;
    this.schema = models.get(modelName).schema;
  }

  __flattenObject(source, maxLevel = 10, callback, flattened = {}, rootKey = '', level = 0) {
    callback = callback || function () {
        return true;
      };
    function getNextKey(key) {
      return `${rootKey}${rootKey ? '.' : ''}${key}`;
    }

    var self = this;
    if ((level < maxLevel) && _.isObject(source) && !_.isArray(source) && callback(source)) {
      level++;
      _.each(_.keys(source), function (k) {
        self.__flattenObject(source[k], maxLevel, callback, flattened, getNextKey(k), level);
      });
    } else if (rootKey !== '') {
      flattened[rootKey] = source;
    }
    return flattened;
  }

  __flattenSchema() {
    return this.__flattenObject(this.schema.obj, this.defaults.maxNesting, function (obj) {
      return !('$type' in obj);
    });
  }

  getQuery(pageNumber = null) {
    var params = this.params();
    var q = {};
    if (params.page) {
      params.page = this.page();
      q.p = params.page;
      if (pageNumber !== null) {
        q.p.number = ((pageNumber > 0) ? pageNumber : 1);
      }
    }
    if (params.sort) {
      q.sort = params.sort;
    }
    if (params.filter) {
      q.f = params.filter;
    }
    if (params.pick) {
      q.pick = params.pick;
    }
    return q;
  }

  getQueryString(questionMark = true, pageNumber = null) {
    var q = qs.stringify(this.getQuery(pageNumber))
      .replace(/%5B/gi, '[').replace(/%5D/gi, ']').replace(/%2C/gi, ',').replace(/%24/gi, '$');
    return questionMark && (q.length > 0) ? ('?' + q) : q;
  }

  params() {
    return {
      page: this.param('page'),
      sort: this.param('sort'),
      filter: this.param('filter'),
      pick: this.param('pick')
    }
  }

  hasParam(param) {
    return this.param(param) !== false;
  }

  param(param, defaults = false) {
    var q = this.req.query;

    switch (param) {
      case 'page':
        return (('p' in q) && _.isObject(q.p) && (('number' in q.p) || ('size' in q.p))) ? q.p : defaults;
      case 'sort':
        return (('sort' in q) && _.isString(q.sort) && (q.sort.length > 0)) ? q.sort : defaults;
      case 'filter':
        return (('f' in q) && _.isObject(q.f) && (_.keys(q.f).length > 0)) ? q.f : defaults;
      case 'pick': {
        return (('pick' in q) && _.isString(q.pick) && (q.pick.length > 0)) ? q.pick : defaults;
      }
    }
    return defaults;
  }

  page() {
    var p = _.defaults(this.param('page'), {
      'number': 1,
      'size': this.defaults.defaultPageSize
    });

    p.number = ((!isNaN(p.number)) && (p.number > 0))
      ? parseInt(p.number) : 1;

    p.size = ((!isNaN(p.size)) && (p.size > 0) && (p.size <= this.defaults.maxPageSize))
      ? parseInt(p.size) : this.defaults.defaultPageSize;

    return p;
  }

  totalPages(numResults) {
    var p = this.page();
    if (p.size > 0) {
      return Math.floor(numResults / p.size) + ((numResults % p.size) > 0 ? 1 : 0);
    }
    return 0;
  }

  /*
   JSON-API style pagination:  p[number]=1&p[size]=100 (in JSON API the param name is page)
   */
  pagination(defaults = {}) {
    var p = this.page();
    return _.defaults({skip: ((p.number - 1) * p.size), limit: p.size}, defaults);
  }

  /*
   JSON-API style sorting:  sort=-attack.base,bs_total,nnid
   */
  sorting(defaults = {}) {
    var sortParam = this.param('sort');
    if (sortParam === false) {
      return defaults;
    }

    var sort = {}, self = this;

    _.each(sortParam.split(','), function (sortProp, i) {
      let dir = sortProp.match(/^-/) ? -1 : 1;
      sortProp = sortProp.replace(/^-/, '');
      if ((i + 1 <= self.defaults.maxSortCriteria) && (sortProp in self.__flattenSchema())) {
        sort[sortProp] = dir;
      }
    });

    return _.defaults({sort: sort}, defaults);
  }

  /*
   JSON-API style filtering:  f[name]=foo&f[nnid][$gte]=123 (in JSON API the param name is filter)
   */
  filter(defaults = {}) {
    var filter = this.param('filter') || defaults;

    if ('$pick' in filter) {
      delete filter.$pick;
    }

    // TODO: reduce filters, validate against model

    return filter;
  }

  /*
   JSON-API (compatible) style pick/fields:  pick=foo,-bar  (Mongo projection)
   in JSON-api this should be called 'fields', but the spec makes it more complicated to use
   */
  pick(defaults = '-_id') {
    var pickParam = this.param('pick'), pick = defaults;

    if (pickParam !== false) {
      // TODO: validate
      pick = _.uniq(_.concat(pickParam.split(','), defaults.split(' '))).join(' ');
    }

    return pick;
  }

  /*
   Combines sorting and pagination
   */
  options(defaults = {}) {
    return _.defaults(this.sorting(), this.pagination(), defaults);
  }

  /*
   JSON-API response
   */
  response(data, totalResults = null) {
    // TODO: json response WIP
    var res = {
      links: {
        self: this.url.full + this.getQueryString(true)
      },
      data: models.transform(data, this.modelName)
    };

    var noData = ((_.isArray(data) && (data.length == 0)) || !data);
    var pn = this.page().number;

    if (this.hasParam('page')) {
      res['links'].first = this.url.full + this.getQueryString(true, 1);
      res['links'].prev = (pn == 1) ? null : this.url.full + this.getQueryString(true, pn - 1);
      res['links'].next = noData ? null : this.url.full + this.getQueryString(true, pn + 1);
    }

    if (_.isNumber(totalResults)) {
      var totalPages = this.totalPages(totalResults);
      res['links'].last = (pn >= totalPages) ? null : this.url.full + this.getQueryString(true, totalPages);
      if (pn + 1 > totalPages) {
        res['links'].next = null;
      }
      res['meta'] = {
        'total': totalResults,
        'total_pages': totalPages
      };
    }
    return res;
  }

}

module.exports = JsonApiHelper;