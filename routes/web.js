module.exports = (app, db, check, validationResult, request, passport, bcrypt, salt) => {

  /* Database seeding */
  require('../database/seeding')(app, db);

  /* App routes */
  app.get('/', (req, res) => {
    return res.render('welcome');
  });

  app.get('/login', (req, res) => {
    return res.render('login', { csrfToken: req.csrfToken() });
  });

  app.post('/login', [
    check('email', 'Provide correct email').trim().escape().isLength({min: 1, max: 50}),
    check('email', 'Email must be a valid email address').isEmail(),
    check('password', 'Provide correct password').trim().escape().isLength({min: 3, max: 50})
  ], (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('login', { error: errors.mapped(), csrfToken: req.csrfToken() });
    } else {
      passport.authenticate('local', (err, user) => {
        if (err) return next(err);
        if (!user) return res.redirect('/register');
        req.logIn(user, (err) => {
          if (err) return next(err);
          res.redirect(303, '/converter');
        });
      })(req, res, next);
    }
  });

  app.get('/register', (req, res) => {
    return res.render('register', { csrfToken: req.csrfToken() });
  });

  app.post('/register', [
    check('user', 'Provide correct name').trim().escape().isLength({min: 1, max: 50}),
    check('email', 'Provide correct email').trim().escape().isLength({min: 1, max: 50}),
    check('email', 'Email must be a valid email address').isEmail(),
    check('password', 'Password must be at least 3').trim().escape().isLength({min: 3, max: 50})
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('register', {error: errors.mapped(), csrfToken: req.csrfToken() });
    } else {
      db.query('SELECT * FROM users WHERE email = ?', req.body.email, (err, result) => {
        if (err) throw err;
        let email = (result.length === 0) ? 'first record in db' : result[0].email;
        if (email === req.body.email) {
          res.redirect('/login');
        } else {
          let hashPassword = bcrypt.hashSync(req.body.password, salt);
          let data = { name: req.body.user, email: req.body.email, password: hashPassword };
          db.query('INSERT INTO users SET ?', data, (err, result) => {
            if (err) throw err;
            res.redirect('/login');
          });
        }
      });
    }
  });

  app.post('/logout', (req, res) => {
    req.logout();
    res.redirect(303, '/');
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
      res.render('converter', { allCurrency: currency, csrfToken: req.csrfToken() });
    });
  });

  app.post('/transaction', (req, res) => {
    let allTransactions = [];
    let currency = req.body.currency;
    request(`https://api.exchangeratesapi.io/latest?base=${currency}`, (error, response, body) => {
      let data = JSON.parse(body);
      let rates = Object.values(data);
      for (let i = 0; i < 100; i++) {
        let amount = Math.floor(Math.random()*100+100);
        let convertedAmount = (amount * rates[0].EUR).toFixed(4);
        let date = new Date();
        let transactionDate = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
        let transaction = {
          date: transactionDate,
          currency: currency,
          amount: amount,
          convertedAmount: convertedAmount
        };
        allTransactions.push(transaction);
      }
      return res.render('transaction', { transactions: allTransactions });
    });
  });

}