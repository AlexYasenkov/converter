module.exports = (app, db, check, validationResult, request, passport, bcrypt, salt) => {

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
      res.render('register', { error: errors.mapped(), csrfToken: req.csrfToken() });
    } else {
      db.query('SELECT * FROM users WHERE email = ?', req.body.email, (err, result) => {
        if (err) throw err;
        let email = (result.length === 0) ? '' : result[0].email;
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

  /* Access to closed sections */
  const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  }

  app.get('/converter', auth, (req, res) => {
    return res.render('converter', { csrfToken: req.csrfToken() });
  });

  app.get('/transactions', auth, (req, res) => {
    let service = 'https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction';
    let urls = [];
    for (let i = 0; i < 1; i++) {
      urls.push(service);
    }
    let result = [];
    let count = 0;
    let allTransactions = [];
    for (let i in urls) {
      request(urls[i], (error, response, body) => {
        let data = JSON.parse(body);
        result.push(data);
        count++;
        if (count === urls.length) {
          for (let i = 0; i < result.length; i++) {
            request(`https://api.exchangeratesapi.io/latest?base=${result[i].currency}`, (error, response, body) => {
              let data = JSON.parse(body);
              let rates = Object.values(data);
              let transaction = {
                createdAt: result[i].createdAt,
                currency: result[i].currency,
                amount: Number(result[i].amount),
                convertedAmount: Number((result[i].amount * rates[0].EUR).toFixed(4)),
                exchangeUrl: 'https://api.exchangeratesapi.io/latest?base=EUR',
                checksum: result[i].checksum
              };
              allTransactions.push(transaction);
              if (allTransactions.length === result.length) {
                let converted = {
                  transactions: allTransactions
                };
                let formData = JSON.stringify(converted);
                console.log(formData);
                request.post({ url:'https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/process-transactions', formData: formData }, function optionalCallback(err, httpResponse, body) {
                  if (err) {
                    return console.error('upload failed:', err);
                  }
                  console.log('Upload successful!  Server responded with:', body);
                });
                res.render('transactions', { transactions: allTransactions });
              }
            });
          }
        }
      });
    }
  });
}