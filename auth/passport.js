module.exports = (passport, LocalStrategy, db) => {
  
  passport.serializeUser((user, done) => {
    done(null, user.id); //id session
  });
    
  passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users', (err, result) => {
      for (let i = 0; i < result.length; i++) { 
        let userData = result[i];
        let user = (userData.id === id) ? userData : false;
        done(null, user);
      }
    });
  });

  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    db.query('SELECT * FROM users', (err, result) => {
      for (let i = 0; i < result.length; i++) {
        let userData = result[i];
        if (email === userData.email && password === userData.password) {
          return done(null, userData);
        } else {
          return done(null, false);
        }
      }
    });
  }));

}