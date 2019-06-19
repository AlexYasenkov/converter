const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const {check, validationResult} = require('express-validator/check');

//DB
const mysql = require('mysql');
const host = 'localhost';
const user = 'root';
const password = 'sanek123';
const db = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: 'nodedata',
  charset: 'utf8mb4_unicode_ci'
});
db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

//run
const app = express();
const port = 3000;

app.set('view engine', 'twig');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//routes
require('./routes/web')(app, db, check, validationResult, request);

app.listen(port, () => {
  console.log(`App listening on port ${port}.`);
});