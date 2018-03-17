'use strict';

import _ from 'lodash';

/**
 * Provides helper methods needed for sending response to client
 *
 * @class     ClientResponseHelper
 * @summary   Provides helper methods needed for sending response to client
 * @author    Anoop M D <anoop.md@sinilabs.co.in>
 */
class ClientResponseHelper {
  /**
   * Parses the joi errors that needs to be sent to the client from the joi error object
   *
   * @static
   * @param  {object} err       - The error object
   * @param  {string} [message] - The error message
   * @return {object}
   */
   static parseJoiError(err, message = 'A validation error occured') {
    let error = new Error();

    error.message = message;

    if(err && err.details) {
      _.each(err.details, (detail) => {
        error.addDetails({
          message: detail.message,
          error: {
            path: detail.path
          }
        });
      });
    }

    return _.extend(error.toJson(), _.pick(err, ['badRequest', 'unauthorized', 'methodNotAllowed', 'internalServerError']));
  }

  /**
   * Parses the error that needs to be sent to the client from the error object
   *
   * @static
   * @param  {object} err       - The error object
   * @param  {string} [message] - The error message
   * @return {object}
   */
  static parseError(err, message) {
    if(err && err.isJoi) {
      return ClientResponseHelper.parseJoiError(err, message);
    }

    return {
      message: message || 'An error occured',
      details: []
    };
  }
}

export default ClientResponseHelper;
