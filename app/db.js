'use strict';

const sqlite = require("sqlite");
const rethink = require('rethinkdb');

module.exports = {
  "rethink": rethink,
  "sqlite": sqlite
};