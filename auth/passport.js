module.exports = (passport, LocalStrategy, db, bcrypt) => {
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = ?', id, (err, result) => {
      if (err) throw err;
      let userData = (result.length === 0) ? '' : result[0];
      let user = (userData.id === id) ? userData : false;
      done(null, user);
    });
  });
  
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    db.query('SELECT * FROM users', (err, result) => {
      if (err) throw err;
      let userData = [];
      for (let i = 0; i < result.length; i++) {
        if (email === result[i].email && bcrypt.compareSync(password, result[i].password)) {
          userData = result[i];
        }
      }
      if (userData.length === 0) {
        return done(null, false);
      } else {
        return done(null, userData);
      }
    });
  }));

}