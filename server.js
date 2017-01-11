'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const APP_PORT = process.env.APP_PORT || 5000;

mongoose.connect('mongodb://mongo:' + process.env.MONGO_PORT + '/demo');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.get('/', function (req, res) {
  res.send({"message": "Hello World!"});
});

db.once('open', function () {
  app.listen(APP_PORT, function () {
    console.log('Example app listening on port ' + APP_PORT);
  });
});