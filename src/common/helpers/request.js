'use strict';

import config from 'config';
import Knex from '/.knex';

let connection = null;

/**
 * The Request class
 *
 * @class     Request
 * @summary   The Request Class
 * @author    Anoop M D <anoop.md@sinilabs.co.in>
 */
class Request {
  /**
   * Constructor
   *
   * @param  {object} req - The express req object
   * @summary constructor
   */
  constructor(req) {
    this.req = req;
    this.data = null;

    // For tests, create a connection everytime
    if(!connection || config.env === 'test') {
      this.knex = new Knex(config.database);
      connection = this.knex.getConnection(config.database);
    }

    this.connection = connection;
  }

  /**
   * Sets the request data
   *
   * @param  {object} data - The request data
   * @return {object}
   */
  setData(data) {
    this.data = data;

    return this.data;
  }

  /**
   * Gets the request data
   *
   * @return {object}
   */
  getData() {
    return this.data;
  }

  /**
   * Gets the request token
   *
   * @return {string}
   */
  getToken() {
    return this.req.token;
  }

  /**
   * Gets the database transaction
   *
   * @return {object}
   */
  getTransaction() {
    return new Promise((resolve, reject) => {
      this.connection.transaction((trx) => {
        resolve(trx);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Gets raw sql statement
   *
   * @param  {string} sql - The sql statement
   * @return {object}
   */
  getRawSql(sql) {
    return this.connection.raw(sql);
  }

  /**
   * Gets the database connection
   *
   * @return {object}
   */
  getConnection() {
    return this.connection;
  }
}

export default Request;
