'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('users', {
    id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      notNull: true,
      length: 50
    },
    email: {
      type: 'string',
      notNull: true,
      length: 50
    },
    password: {
      type: 'string',
      notNull: true,
      length: 200
    },
    date: {
      type: 'timestamp'
    }
  });
};

exports.down = function (db) {
  return db.dropTable('users');
};

exports._meta = {
  "version": 1
};
