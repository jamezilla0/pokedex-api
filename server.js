'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.get('/', function (req, res) {
  res.send({"message": "Hello World!"});
});

db.once('open', function() {
  app.listen(5000, function () {
    console.log('Example app listening on port 5000!')
  });
});