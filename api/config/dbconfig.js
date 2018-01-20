'use strict';
//https://github.com/IBM-Bluemix/dashdb-nodejs-helloworld/blob/master/app.js
const mysql = require('mysql'),
  config = require('./config');

var Db = function () {
  this.mySqlPool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.dataBaseName,
    multipleStatements: true,
  });
  return this;
} //Db

/**
 * Mysql Connection
 */
Db.prototype.sqlQuery = function (query) {
  return new Promise((resolve, reject) => {
    this.mySqlPool.getConnection(function (err, connection) {      
      connection.query(query, function (err, rows) {
        if (!err) {
          connection.release();
          resolve(rows);
        } else {
          connection.release();
          reject(err);
        }
        // Don't use the connection here, it has been returned to the pool. 
      });
    });
  });
} //getConn

/**
 * End Mysql Connection
 */
module.exports = new Db();