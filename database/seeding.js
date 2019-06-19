module.exports = (app, db) => {
  /* Create database */
  app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodedata';
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.send("Database created");
    });
  });
  /* Create table user */
  app.get('/create-users-table', (req, res) => {
    let sql = 'CREATE TABLE users (id int NOT NULL PRIMARY KEY AUTO_INCREMENT, name varchar(50) NOT NULL, email varchar(50) NOT NULL, password varchar(50) NOT NULL)';
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.send("Table created");
    });
  });
  /* Create table transaction */
  app.get('/create-transaction-table', (req, res) => {
    let sql = 'CREATE TABLE transaction (id int NOT NULL PRIMARY KEY AUTO_INCREMENT, currency varchar(50) NOT NULL, amount int NOT NULL, date timestamp DEFAULT CURRENT_TIMESTAMP)';
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.send("Table created");
    });
  });
}