'use strict';

import _ from 'lodash';
import config from 'config';
import logger from '../common/helpers/logger';
import response from '../common/helpers/response';
import ClientResponseHelper from '../common/helpers/client-response-helper';
import ReminderManager from '../manager/reminder';
import Request from '../../common/request/request';


/**
 * The Reminder Controller
 *
 * @class     ReminderController
 * @summary   Provides helper for routes on reminders
 * @author    Anoop M D <anoop.md@sinilabs.co.in>
 * @copyright SINI Labs Technologies LLP
 */
class ReminderController {
  /**
   * Handles get reminders request
   *
   * @static
   * @param  {object}   req  - Express request object
   * @param  {object}   res  - Express response object
   * @param  {function} next - callback
   * @return {undefined}
   */
  static get(req, res, next) {
    let data = {
      type: req.query.type,
      date: req.query.date,
      from: req.query.from,
      to: req.query.to,
      customer_id: Number(req.query.customer_id),
      month: Number(req.query.month),
      year: Number(req.query.year),
      account_id: Number(req.user.account_id)
    };

    logger.debug({message: 'Reminder Controller: Recevied GET request for getting the reminders', data: data});

    let request = new Request(req);
    let reminderManager = new ReminderManager(request);

    reminderManager
      .get(data)
      .then((reminders) => {
        logger.debug({message: 'Reminder Controller: Fetched the reminders'});
        return response.ok(res, reminders);
      })
      .catch((error) => {
        logger.error({message: 'Reminder Controller: An Error Occured', data: error});
        return response.error(res, ClientResponseHelper.parseError(error));
      });
  }

  /**
   * Handles create reminder request
   *
   * @static
   * @param  {object}   req  - Express request object
   * @param  {object}   res  - Express response object
   * @param  {function} next - callback
   * @return {undefined}
   */
  static post(req, res, next) {
    let keys = ['description', 'customer_id', 'datetime', 'is_done'];

    let data = _.extend({}, _.pick(req.body, keys), {
      account_id: Number(req.user.account_id)
    });

    logger.debug({message: 'Reminder Controller: Recevied POST request for creating a reminder', data: data});

    let request = new Request(req);
    let reminderManager = new ReminderManager(request);

    reminderManager
      .create(data)
      .then((reminder) => {
        logger.debug({message: 'Reminder Controller: Created the reminder', data: reminder});
        return response.created(res, reminder);
      })
      .catch((error) => {
        logger.error({message: 'Reminder Controller: An Error Occured', data: error});
        return response.error(res, ClientResponseHelper.parseError(error));
      });
  }

  /**
   * Handles update reminder request
   *
   * @static
   * @param  {object}   req  - Express request object
   * @param  {object}   res  - Express response object
   * @param  {function} next - callback
   * @return {undefined}
   */
  static put(req, res, next) {
    let keys = ['description', 'customer_id', 'datetime', 'is_done'];

    let data = _.extend({}, _.pick(req.body, keys), {
      id: Number(req.params.id),
      account_id: Number(req.user.account_id)
    });

    logger.debug({message: 'Reminder Controller: Recevied PUT request for updating a reminder', data: data});

    let request = new Request(req);
    let reminderManager = new ReminderManager(request);

    reminderManager
      .update(data)
      .then((reminder) => {
        logger.debug({message: 'Reminder Controller: Updated the reminder', data: reminder});
        return response.ok(res, reminder);
      })
      .catch((error) => {
        logger.error({message: 'Reminder Controller: An Error Occured', data: error});
        return response.error(res, ClientResponseHelper.parseError(error));
      });
  }

  /**
   * Handles delete reminder request
   *
   * @static
   * @param  {object}   req  - Express request object
   * @param  {object}   res  - Express response object
   * @param  {function} next - callback
   * @return {undefined}
   */
  static remove(req, res, next) {
    let data = {
      id: Number(req.params.id),
      account_id: Number(req.user.account_id)
    };

    logger.debug({message: 'Reminder Controller: Recevied DELETE request for deleting the reminder', data: data});

    let request = new Request(req);
    let reminderManager = new ReminderManager(request);

    reminderManager
      .remove(data)
      .then(() => {
        logger.debug({message: 'Reminder Controller: Removed the reminder'});
        return response.noContent(res);
      })
      .catch((error) => {
        logger.error({message: 'Reminder Controller: An Error Occured', data: error});
        return response.error(res, ClientResponseHelper.parseError(error));
      });
  }

  /**
   * Handles request to mark reminder as done
   *
   * @static
   * @param  {object}   req  - Express request object
   * @param  {object}   res  - Express response object
   * @param  {function} next - callback
   * @return {undefined}
   */
  static markAsDone(req, res, next) {
    let data = {
      id: Number(req.params.id),
      account_id: Number(req.user.account_id)
    };

    logger.debug({message: 'Reminder Controller: Recevied PATCH request for marking the reminder as done', data: data});

    let request = new Request(req);
    let reminderManager = new ReminderManager(request);

    reminderManager
      .markAsDone(data)
      .then(() => {
        logger.debug({message: 'Reminder Controller: Marked the reminder as done'});
        return response.noContent(res);
      })
      .catch((error) => {
        logger.error({message: 'Reminder Controller: An Error Occured wbile marking the reminder as done', data: error});
        return response.error(res, ClientResponseHelper.parseError(error));
      });
  }
}

export default ReminderController;
