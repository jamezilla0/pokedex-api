'use strict';

const express = require("express");
const mongoose = require("mongoose");
const sqlite = require("sqlite");

mongoose.connect('mongodb://mongo:' + process.env.MONGO_PORT + '/pokedex');

const mongo = mongoose.connection;

mongo.on('error', console.error.bind(console, 'connection error:'));

module.exports = {
  "mongo": mongo,
  "sqlite": sqlite
};