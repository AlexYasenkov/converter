const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const request = require('request');
const {check, validationResult} = require('express-validator/check');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const csrf = require('csurf');

//hashPassword
const bcrypt = require('bcrypt');
const salt = 10;

//DB
require('dotenv').config();
const mysql = require('mysql');
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DB_NAME;
const db = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
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
app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());

require('./auth/passport')(passport, LocalStrategy, db, bcrypt);
require('./routes/web')(app, db, check, validationResult, request, passport, bcrypt, salt);

app.listen(port, () => {
  console.log(`App listening on port ${port}.`);
});