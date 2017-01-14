'use strict';

const sqlite = require("sqlite");
const rethink = require('rethinkdb');

module.exports = {
  "sqlite": sqlite,
  "rethink": rethink
};