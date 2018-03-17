'use strict';

import _ from 'lodash';
import config from 'config';
import LovelaceLogger from 'lovelace-lib-logger';
import LovelaceError from 'lovelace-lib-error';

/**
 * The Common Entity class
 *
 * @class     CommonEntity
 * @summary   The CommonEntity Class
 * @author    Anoop M D <anoop.md@sinilabs.co.in>
 */
class CommonEntity {
  /**
   * Constructor
   *
   * @param  {object} request  - The request
   * @summary initializes the database connection.get()
   */
  constructor(request) {
    this.request = request;
    this.model = {};
    this.logName = 'Common Entity';
    this.connection = {get: () => request.getConnection()};
    this.logger = new LovelaceLogger(config.logger.transporters);
  }

  /**
   * Returns an error
   *
   * @access private
   * @param  {object} error   - The error
   * @param  {string} message - The error message
   * @return {object}
   */
  _error(error, message) {
    this.logger.error({message: `${this.logName}: ${message}`, data: error});

    if(error && error.constructor && error.constructor.name === 'LovelaceError') {
      return Promise.reject(error);
    }

    let err = new LovelaceError({
      name: `${this.logName} Error`,
      cause: error,
      info: {
        message: message,
        details: [{
          message: message
        }]
      }
    }, message);
    err.internalServerError = true;
    return Promise.reject(err);
  }

  /**
   * Gets the database connection.get()
   *
   * @return {object}
   */
  getConnection() {
    return this.request.getConnection();
  }

  /**
   * Gets a knex tranasction
   *
   * @async
   * @return {Promise}
   */
  async getTransaction() {
    return new Promise((resolve, reject) => {
      this.connection.get().transaction((trx) => {
        return resolve(trx);
      })
      .catch(function(error) {
        return reject(error);
      });
    });
  }

  /**
   * Starts a knex tranasction
   *
   * @async
   * @return {Promise}
   */
  async startTransaction() {
    return this.getTransaction();
  }

  /**
   * Get the fillable attributes for the model.
   *
   * @return {Array}
   */
  getFillable() {
    return [];
  }

  /**
   * Convert the Model to json
   *
   * @param  {object} trx - The knex transaction
   * @return {Promise}
   */
  json(trx) {
    return _.pick(this.model, this.getFillable());
  }
}

export default CommonEntity;
