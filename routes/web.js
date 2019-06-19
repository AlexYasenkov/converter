module.exports = (app, db, check, validationResult, request) => {
  /* Database seeding */
  require('../database/seeding')(app, db);

  /* App routes */
  app.get('/', (req, res) => {
    return res.render('welcome');
  });

  app.get('/register', (req, res) => {
    return res.render('register');
  });

  app.post('/register', [
    check('user', 'Provide correct name').trim().isLength({min: 1, max: 50}),
    check('email', 'Provide correct email').trim().isLength({min: 1, max: 50}),
    check('email', 'Email must be a valid email address').isEmail(),
    check('password', 'Provide correct password').trim().isLength({min: 3, max: 50})
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', {error: errors.mapped()});
    } else {
      let user = req.body.user;
      let email = req.body.email;
      let password = req.body.password;
      let data = {name: user, email: email, password: password};
      let sql = 'INSERT INTO users SET ?';
      db.query(sql, data, (err, result) => {
        if (err) throw err;
        return res.redirect('/');
      });
    }
  });

  app.get('/login', (req, res) => {
    return res.render('login');
  });

  app.post('/login', [
    check('email', 'Provide correct email').trim().isLength({min: 1, max: 50}),
    check('email', 'Email must be a valid email address').isEmail(),
    check('password', 'Provide correct password').trim().isLength({min: 3, max: 50})
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', {error: errors.mapped()});
    } else {
      let email = req.body.email;
      let password = req.body.password;
      let data = {email: email, password: password};
      /*let sql = 'INSERT INTO users SET ?';
      db.query(sql, data, (err, result) => {
        if (err) throw err;
        return res.redirect('/');
      });*/
    }
  });

}