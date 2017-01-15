"use strict";

const _ = require("lodash");

var _defaults = {
  maxPageSize: 100,
  defaultPageSize: 24,
  maxSortCriteria: 5,
  maxFilters: 5,
  maxNesting: 5
};

function _get_param(req, param, defaults = false) {
  var q = req.query;

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

function _get_input_params(req) {
  return {
    page: _get_param(req, 'page'),
    sort: _get_param(req, 'sort'),
    filter: _get_param(req, 'filter'),
    pick: _get_param(req, 'pick')
  }
}

function _get_parsed_params(req) {
  return {
    page: _parse_page(req),
    sort: _parse_sort(req),
    filter: _parse_filter(req),
    pick: _parse_pick(req)
  }
}

function _get_query_params(req, pageNumber = null) {
  var params = _get_input_params(req);
  var q = {};
  if (params.page) {
    params.page = _parse_page(req);
    q.p = params.page;
    if (_.isNumber(pageNumber)) {
      q.p.number = ((pageNumber > 0) ? pageNumber : 1);
    }
    if (!'size' in q.p) {
      q.p.size = _defaults.defaultPageSize;
    }
    if (!'number' in q.p) {
      q.p.number = 1;
    }
  } else if (_.isNumber(pageNumber)) {
    q.p = {
      number: pageNumber,
      size: _defaults.defaultPageSize
    };
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

function _parse_page(req) {
  var p = _.defaults(_get_param(req, 'page') || {}, {
    'number': 1,
    'size': _defaults.defaultPageSize
  });

  p.number = ((!isNaN(p.number)) && (p.number > 0))
    ? parseInt(p.number) : 1;

  p.size = ((!isNaN(p.size)) && (p.size > 0) && (p.size <= _defaults.maxPageSize))
    ? parseInt(p.size) : _defaults.defaultPageSize;

  return p;
}

function _parse_sort(req) {
  var sortParam = _get_param(req, 'sort');
  if (sortParam === false) {
    return {};
  }

  var sort = {};

  _.each(sortParam.split(','), function (sortProp, i) {
    let dir = sortProp.match(/^-/) ? -1 : 1;
    if (i + 1 <= _defaults.maxSortCriteria) {
      sort[sortProp.replace(/^-/, '')] = dir;
    }
  });

  // TODO: reduce sorts, validate against model

  return {sort: sort};
}

function _parse_filter(req) {
  var filter = _.clone(_get_param(req, 'filter') || {});

  if ('$pick' in filter) {
    delete filter.$pick;
  }

  //filter.$and = ('$and' in filter) ? filter.$and : [filter];

  // TODO: reduce filters, validate against model

  return filter;
}

function _parse_pick(req) {
  var defaults = '-_id';
  var pickParam = _get_param(req, 'pick'), pick = defaults;

  if (pickParam !== false) {
    // TODO: reduce picks, validate against model
    pick = _.uniq(_.concat(pickParam.split(','), defaults.split(' '))).join(' ');
  }

  return pick;
}

module.exports = {
  'parse': function (req) {
    var params = {};
    params.input = _get_input_params(req);
    params.parsed = _get_parsed_params(req);
    params.query = _get_query_params(req);
    params.queryWithPage = function (pageNumber) {
      return _get_query_params(req, pageNumber);
    };
    return params;
  }
};