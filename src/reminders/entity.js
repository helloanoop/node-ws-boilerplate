'use strict';

import _ from 'lodash';
import config from 'config';
import Joi from 'joi';
import Base from '../../common/entity/base';
import reminderSchema from '../schema';

/**
 * The Reminder Entity
 * @class     Reminder
 * @summary   Provides helper for database CRUD ops on Reminder
 * @author    Anoop M D <anoop.md@sinilabs.co.in>
 */
class Reminder extends Base {
  /**
   * Constructor
   *
   * @param  {object} request  - The request
   * @summary initializes the database connection.get()
   */
  constructor(request) {
    super(request);
    this.logName = 'Reminder Entity';
  }

  /**
   * Set the description
   *
   * @param  {string} description - The description
   * @return {Reminder}
   */
  setDescription(description) {
    this.model.description = description;
    return this;
  }

  /**
   * Set the datetime
   *
   * @param  {string} datetime - The datetime
   * @return {Reminder}
   */
  setDatetime(datetime) {
    this.model.datetime = datetime;
    return this;
  }

  /**
   * Set the is_done
   *
   * @param  {string} isDone - Whether reminder is completed
   * @return {Reminder}
   */
  setIsDone(isDone) {
    this.model.is_done = isDone;
    return this;
  }

  /**
   * Set the customer id
   *
   * @param  {string} customerId - The customer id
   * @return {Reminder}
   */
  setCustomerId(customerId) {
    this.model.customer_id = customerId;
    return this;
  }

  /**
   * Get the fillable attributes for the model.
   *
   * @return {Array}
   */
  getFillable() {
    return ['description', 'customer_id', 'datetime', 'is_done', 'account_id'];
  }

  /**
   * Get the displayable attributes for the model.
   *
   * @return {Array}
   */
  getDisplayable() {
    return ['id', 'description', 'customer_id', 'datetime', 'is_done'];
  }

  /**
   * Get all reminders
   *
   * @async
   * @param  {number} accountId    - The account id
   * @param  {number} [customerId] - The account id
   * @return {Promise}
   */
   async all(accountId, customerId) {
    let where = {
      is_deleted: 0,
      account_id: accountId
    };

    if(customerId && _.isNumber(customerId)) {
      where['customer_id'] = customerId;
    }

    let fields = this.getDisplayable();
    return this.connection.get()
          .select(...fields)
          .from(config.db.tables.reminders.reminder)
          .where(where);
  }

  /**
   * Get reminders by date
   *
   * @async
   * @param  {string} date         - The date
   * @param  {number} accountId    - The account id
   * @param  {number} [customerId] - The account id
   * @return {Promise}
   */
   async getByDate(date, accountId, customerId) {
    let where = {
      is_deleted: 0,
      account_id: accountId
    };

    if(customerId && _.isNumber(customerId)) {
      where['customer_id'] = customerId;
    }
    let fields = this.getDisplayable();
    return this.connection.get()
          .select(...fields)
          .from(config.db.tables.reminders.reminder)
          .where(where)
          .whereRaw('DATE(datetime) = DATE(?)', [date]);
  }

  /**
   * Get reminders by month
   *
   * @async
   * @param  {string} month        - The month
   * @param  {string} year         - The year
   * @param  {number} accountId    - The account id
   * @param  {number} [customerId] - The account id
   * @return {Promise}
   */
  async getByMonth(month, year, accountId, customerId) {
    let where = {
      is_deleted: 0,
      account_id: accountId
    };

    if(customerId && _.isNumber(customerId)) {
      where['customer_id'] = customerId;
    }
    let fields = this.getDisplayable();
    return this.connection.get()
          .select(...fields)
          .from(config.db.tables.reminders.reminder)
          .where(where)
          .whereRaw('MONTH(datetime) = ? AND YEAR(datetime) = ?', [month, year]);
  }

  /**
   * Gets reminders by range
   *
   * @async
   * @param  {string} to           - The to date
   * @param  {string} from         - The from date
   * @param  {number} accountId    - The account id
   * @param  {number} [customerId] - The account id
   * @return {Promise}
   */
  async getByRange(to, from, accountId, customerId) {
    let where = {
      is_deleted: 0,
      account_id: accountId
    };

    if(customerId && _.isNumber(customerId)) {
      where['customer_id'] = customerId;
    }
    let fields = this.getDisplayable();
    return this.connection.get()
          .select(...fields)
          .from(config.db.tables.reminders.reminder)
          .where(where)
          .whereRaw('DATE(datetime) >= DATE(?)', [from])
          .whereRaw('DATE(datetime) <= DATE(?)', [to]);
  }

  /**
   * Checks if an reminder exists by id
   *
   * @async
   * @param  {number} id       - The reminder id
   * @param  {number} accountId - The account id
   * @return {Promise}
   */
  async exists(id, accountId) {
    return await this.findById(id, accountId);
  }

  /**
   * Gets a reminder by id
   *
   * @async
   * @param  {number} id       - The reminder id
   * @param  {number} accountId - The account id
   * @return {Promise}
   */
  async findById(id, accountId) {
    try {
      let fields = this.getDisplayable();
      let reminder = await this.connection.get()
                .first(...fields)
                .from(config.db.tables.reminders.reminder)
                .where({
                  'id': id,
                  'is_deleted': 0,
                  'account_id': accountId
                });

      if(!reminder || !reminder.id) {
        this.logger.error({message: 'Reminder Entity: An error occured while fetching the reminder', data: reminder});
        throw new Error('An error occured while fetching the combo pack');
      }

      this.logger.debug({message: 'Reminder Entity: Fetched the reminder', data: reminder});
      return reminder;
    } catch (error) {
      return this._error(error, 'An error occured while fetching the reminder');
    }
  }

  /**
   * Validates a reminder
   *
   * @param  {object} data - The reminder
   * @return {object}
   */
  validate(data) {
    this.logger.debug({message: 'Reminder Entity: Validating data', data: data});
    return new Promise((resolve, reject) => {
      let {error, value} = Joi.validate(data, reminderSchema, {abortEarly: false});
      let reminder = value;

      if(error) {
        error.badRequest = true;
        return reject(error);
      }

      return resolve(reminder);
    });
  }

  /**
   * Create a reminder
   *
   * @return {Promise}
   */
  async save() {
    try {
      let reminder = _.pick(this.model, this.getFillable());

      await this.validate(reminder);
      let savedReminder = await this.connection.get()
                    .into(config.db.tables.reminders.reminder)
                    .insert(reminder);

      if(!savedReminder || !_.isArray(savedReminder) || !savedReminder.length) {
        this.logger.debug({message: 'Reminder Entity: An error occured while creating the reminder', data: savedReminder});
        throw(new Error('Reminder was not created'));
      }

      return savedReminder[0];
    } catch (error) {
      return this._error(error, 'An error occured while saving the reminder');
    }
  }

  /**
   * Update an reminder
   *
   * @param  {number} id       - The reminder id
   * @param  {number} accountId - The account id
   * @return {Promise}
   */
  async update(id, accountId) {
    try {
      let reminder = _.pick(this.model, this.getFillable());

      await this.validate(reminder);
      let numRowsUpdated = await this.connection.get()
                    .into(config.db.tables.reminders.reminder)
                    .where({
                      'id': id,
                      'account_id': accountId
                    })
                    .update(reminder);

      if(numRowsUpdated !== 1) {
        this.logger.debug({message: 'An error occured while updating the reminder', data: numRowsUpdated});
        throw new Error('An error occured while updating the reminder');
      }

      return numRowsUpdated;
    } catch (error) {
      return this._error(error, 'An error occured while updating the reminder');
    }
  }

  /**
   * Delete an reminder
   *
   * @param  {number} id       - The reminder id
   * @param  {number} accountId - The account id
   * @return {Promise}
   */
  async remove(id, accountId) {
    try {
      let numRowsUpdated = await this.connection.get()
                    .into(config.db.tables.reminders.reminder)
                    .where({
                      'id': id,
                      'account_id': accountId
                    })
                    .update({
                      is_deleted: 1
                    });

      if(numRowsUpdated !== 1) {
        this.logger.error({message: 'An error occured while deleting the reminder', data: numRowsUpdated});
        throw new Error('An error occured while deleting the reminder');
      }

      return numRowsUpdated;
    } catch (error) {
      return this._error(error, 'An error occured while deleting the reminder');
    }
  }

  /**
   * Marks a reminder as done
   *
   * @param  {number} id       - The reminder id
   * @param  {number} accountId - The account id
   * @return {Promise}
   */
  async markAsDone(id, accountId) {
    try {
      let numRowsUpdated = await this.connection.get()
                    .into(config.db.tables.reminders.reminder)
                    .where({
                      'id': id,
                      'account_id': accountId
                    })
                    .update({
                      is_done: 1
                    });

      if(numRowsUpdated !== 1) {
        this.logger.error({message: 'An error occured while marking the reminder as done', data: numRowsUpdated});
        throw new Error('An error occured while marking the reminder as done');
      }

      return numRowsUpdated;
    } catch (error) {
      return this._error(error, 'An error occured while marking the reminder as done');
    }
  }
}

export default Reminder;
