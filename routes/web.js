module.exports = (app, db, check, validationResult, request, passport) => {
  /* Database seeding */
  require('../database/seeding')(app, db);

  /* App routes */
  app.get('/', (req, res) => {
    //console.log(req.session);
    return res.render('welcome');
  });

  app.get('/login', (req, res) => {
    return res.render('login');
  });

  app.post('/login', [
    check('email', 'Provide correct email').trim().isLength({min: 1, max: 50}),
    check('email', 'Email must be a valid email address').trim().isEmail(),
    check('password', 'Provide correct password').trim().isLength({min: 3, max: 50})
  ], (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('login', {error: errors.mapped()});
    } else {
      passport.authenticate('local', (err, user) => {
        if (err) return next(err);
        if (!user) return res.redirect('/login');
        req.logIn(user, (err) => {
          if (err) return next(err);
          res.redirect(303, '/converter');
        });
      })(req, res, next);
    }
  });

  app.get('/register', (req, res) => {
    return res.render('register');
  });

  app.post('/register', [
    check('user', 'Provide correct name').trim().isLength({min: 1, max: 50}),
    check('email', 'Provide correct email').trim().isLength({min: 1, max: 50}),
    check('email', 'Email must be a valid email address').isEmail(),
    check('password', 'Provide correct password').trim(),
    check('password', 'Password must be at least 3').isLength({min: 3, max: 50})
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', {error: errors.mapped()});
    } else {
      let name = req.body.user;
      let email = req.body.email;
      let password = req.body.password;
      let data = {name: name, email: email, password: password};
      let sql = 'INSERT INTO users SET ?';
      db.query(sql, data, (err, result) => {
        if (err) throw err;
        return res.redirect('/');
      });
    }
  });

  /* Access to currency converter */
  let auth = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  }
  app.get('/converter', auth, (req, res) => {
    request('https://api.exchangeratesapi.io/latest', (error, response, body) => {
      let data = JSON.parse(body);
      let currency = Object.keys(data.rates);
      return res.render('converter', {allCurrency: currency});
    });
  });

  app.post('/logout', (req, res) => {
    req.logout();
    res.redirect(303, '/');
  });

  app.post('/transaction', (req, res) => {
    let allTransaction = [];
    let currency = req.body.currency;
    request(`https://api.exchangeratesapi.io/latest?base=${currency}`, (error, response, body) => {
      let data = JSON.parse(body);
      let rates = Object.values(data);
      for (let i = 0; i < 10; i++) {
        let amount = Math.floor(Math.random()*100+100);
        let convertedAmount = (amount * rates[2].EUR).toFixed(4);
        let transaction = {
          date: rates[1],
          currency: rates[0],
          amount: amount,
          convertedAmount: convertedAmount
        };
        allTransaction.push(transaction);
      }
      return res.render('transaction', {transactions: allTransaction});
    });
  });

}