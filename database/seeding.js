module.exports = (app, db) => {

  app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodedata';
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.send("Database created");
    });
  });

  app.get('/create-users-table', (req, res) => {
    let sql = 'CREATE TABLE users (id int NOT NULL PRIMARY KEY AUTO_INCREMENT, name varchar(50) NOT NULL, email varchar(50) NOT NULL, password varchar(200) NOT NULL)';
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.send("Table created");
    });
  });

}