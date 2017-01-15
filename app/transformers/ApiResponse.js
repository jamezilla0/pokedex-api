"use strict";

const _ = require("lodash");
const qs = require('qs');

function _get_url(req) {
  var url = req.originalUrl.split('?', 2);
  return {
    path: url[0],
    query: url[1] !== undefined ? url[1] : '',
    full: req.protocol + '://' + req.get('host') + url[0]
  };

}

function _get_query_string(params, pageNumber = null, questionMark = true) {
  var q = qs.stringify(params.queryWithPage(pageNumber))
    .replace(/%5B/gi, '[').replace(/%5D/gi, ']').replace(/%2C/gi, ',').replace(/%24/gi, '$');
  return questionMark && (q.length > 0) ? ('?' + q) : q;
}

function _get_total_pages(numResults, pageSize) {
  if (pageSize > 0) {
    return Math.floor(numResults / pageSize) + ((numResults % pageSize) > 0 ? 1 : 0);
  }
  return 0;
}

function _transform_response(results, totalResults, params, req) {
  var noData = ((_.isArray(results) && (results.length == 0)) || !results);
  var pn = params.parsed.page.number;
  var url = _get_url(req);
  var body = {
    links: {
      self: url.full + _get_query_string(params)
    },
    meta: {}
  };

  if ((params.input.page !== false) || _.isNumber(totalResults)) {
    body.links.first = url.full + _get_query_string(params, 1);
    body.links.prev = (pn == 1) ? null : url.full + _get_query_string(params, pn - 1);
    body.links.next = noData ? null : url.full + _get_query_string(params, pn + 1);
  }

  if (_.isNumber(totalResults)) {
    var totalPages = _get_total_pages(totalResults, params.parsed.page.size);

    body.links.last = (pn >= totalPages) ? null : url.full + _get_query_string(params, totalPages);
    if (pn + 1 > totalPages) {
      body.links.next = null;
    }
    body.meta = {
      'counters': {
        'results': totalResults,
        'pages': totalPages
      }
    };
  }

  body.data = results;
  return body;
}

module.exports = {
  'transform': function (results, totalResults, params, req) {
    return _transform_response(results, totalResults, params, req);
  },
  'send': function (data, res) {
    res.set('Content-Type', 'application/vnd.api+json');
    return res.json(data);
  }
};