const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const request = require('request');
const {check, validationResult} = require('express-validator/check');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  store: new FileStore(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 60*60*1000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

require('./auth/passport')(passport, LocalStrategy, db);
require('./routes/web')(app, db, check, validationResult, request, passport);

app.listen(port, () => {
  console.log(`App listening on port ${port}.`);
});