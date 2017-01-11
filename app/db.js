'use strict';

var express = require("express");
var mongoose = require("mongoose");
var sqlite = require("sqlite");

mongoose.connect('mongodb://mongo:' + process.env.MONGO_PORT + '/pokedex');

var mongo = mongoose.connection;

mongo.on('error', console.error.bind(console, 'connection error:'));

module.exports = {
  "mongo": mongo,
  "sqlite": sqlite
};