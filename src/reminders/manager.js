'use strict';

import Joi from 'lovelace-lib-joi';
import _ from 'lodash';
import config from 'config';
import ReminderEntity from '../entity/reminder';
import ValidationHelper from '../common/helpers/validation';
import CustomerManager from '../customers/manager';
import reminderSchema from '../schema/reminder';

/**
 * The Reminder Manager
 *
 * @class     ReminderManager
 * @summary   Provides helper for CRUD ops on reminder
 * @author    Anoop M D <anoop.md@sinilabs.co.in>
 * @copyright SINI Labs Technologies LLP
 */
class ReminderManager {
  /**
   * Constructor
   *
   * @param  {object} request - The request model
   * @summary initializes the logger
   */
  constructor(request) {
    this.request = request;
    this.validationHelper = new ValidationHelper(this.request);
    this.logger = logger;
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
    this.logger.error({message: `Reminder Manager: ${message}`, data: error});

    if(error && error.isJoi) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }

  /**
   * Validates a reminder
   *
   * @param  {object} data - The reminder
   * @return {object}
   */
  validate(data) {
    this.logger.debug({message: 'Reminder Manager: Validating data', data: data});
    return new Promise((resolve, reject) => {
      /** Reminder schema validation */
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
   * Populate customer details
   *
   * @async
   * @param  {array} reminders  - The reminders
   * @param  {number} accountId - The account id
   * @return {Promise}
   * @throws {LovelaceError}
   */
  async populateCustomer(reminders = [], accountId) {
    try {
      this.logger.debug({message: 'Reminder Manager: Populating customers in reminders'});
      await this.validationHelper.validateId(accountId);
      let customerManager = new CustomerManager(this.request);
      for(let reminder of reminders) {
        if(reminder.customer_id && _.isNumber(reminder.customer_id)) {
          reminder.customer = await customerManager.getMeta(reminder.customer_id, accountId);
        }
      }
      this.logger.debug({message: 'Reminder Manager: Finished populating customers in reminders'});
    } catch (error) {
      return this._error(error, 'An error occured while populating customers in the reminders');
    }
  }

  /**
   * Gets reminders by date/month
   *
   * @async
   * @param  {object} data    - The data
   * @return {Promise}
   * @throws {LovelaceError}
   */
  async get(data) {
    try {
      await this.validationHelper.validateId(data.account_id);
      await this.validationHelper.validateEnum(data.type, ['all', 'day', 'month', 'range']);

      let reminders = [];

      if(data.customer_id) {
        await this.validationHelper.validateId(data.customer_id);
      }

      if(data.type === 'all') {
        let entity = new ReminderEntity(this.request);
        reminders = await entity.all(data.account_id, data.customer_id);
        this.logger.debug({message: 'Reminder Manager: fetched all reminders'});
      }

      if(data.type === 'day') {
        await this.validationHelper.validateDate(data.date);

        let entity = new ReminderEntity(this.request);
        reminders = await entity.getByDate(data.date, data.account_id, data.customer_id);
        this.logger.debug({message: 'Reminder Manager: fetched reminders by date'});
      }

      if(data.type === 'month') {
        await this.validationHelper.validateMonth(data.month);
        await this.validationHelper.validateYear(data.year);

        let entity = new ReminderEntity(this.request);
        reminders = await entity.getByMonth(data.month, data.year, data.account_id, data.customer_id);
        this.logger.debug({message: 'Reminder Manager: fetched reminders by month'});
      }

      if(data.type === 'range') {
        await this.validationHelper.validateDate(data.from);
        await this.validationHelper.validateDate(data.to);

        let entity = new ReminderEntity(this.request);
        reminders = await entity.getByRange(data.to, data.from, data.account_id, data.customer_id);
        this.logger.debug({message: 'Reminder Manager: fetched reminders by range'});
      }

      await this.populateCustomer(reminders, data.account_id);

      return reminders;
    } catch (error) {
      this.logger.error({message: 'Reminder Manager: An error occured while fetching the reminders', data: error});
      return this._error(error, 'An error occured while fetching the reminders');
    }
  }

  /**
   * Create a reminder
   *
   * @async
   * @param  {object} reminder - The reminder
   * @return {Promise}
   * @throws {LovelaceError}
   */
  async create(reminder) {
    try {
      let validatedReminder = await this.validate(reminder);
      let entity = new ReminderEntity(this.request);

      entity
        .setDescription(validatedReminder.description)
        .setDatetime(validatedReminder.datetime)
        .setIsDone(validatedReminder.is_done)
        .setCustomerId(validatedReminder.customer_id)
        .setAccountId(validatedReminder.account_id);

      let createdReminderId = await entity.save();

      this.logger.debug({message: 'Reminder Manager: Created the reminder', data: createdReminderId});
      let createdReminder = await entity.findById(createdReminderId, reminder.account_id);
      await this.populateCustomer([createdReminder], reminder.account_id);

      return createdReminder;
    } catch (error) {
      return this._error(error, 'An error occured while creating the reminder');
    }
  }

  /**
   * Update a reminder
   *
   * @async
   * @param  {object} reminder - The reminder
   * @return {Promise}
   * @throws {LovelaceError}
   */
  async update(reminder) {
    try {
      await this.validationHelper.validateId([reminder.id, reminder.account_id]);

      let validatedReminder = await this.validate(reminder);
      let entity = new ReminderEntity(this.request);

      entity
        .setDescription(validatedReminder.description)
        .setDatetime(validatedReminder.datetime)
        .setIsDone(validatedReminder.is_done)
        .setCustomerId(validatedReminder.customer_id)
        .setAccountId(validatedReminder.account_id);

      await entity.update(reminder.id, reminder.account_id);

      this.logger.debug({message: 'Reminder Manager: Updated the reminder'});
      let updatedReminder = await entity.findById(reminder.id, reminder.account_id);
      await this.populateCustomer([updatedReminder], reminder.account_id);

      return updatedReminder;
    } catch (error) {
      return this._error(error, 'An error occured while updating the reminder');
    }
  }

  /**
   * Removes a reminder
   *
   * @async
   * @param  {object} reminder - The reminder to remove
   * @return {object}
   * @throws {LovelaceError}
   */
  async remove(reminder) {
    try {
      await this.validationHelper.validateId([reminder.id, reminder.account_id]);

      let entity = new ReminderEntity(this.request);
      await entity.exists(reminder.id, reminder.account_id);
      await entity.remove(reminder.id, reminder.account_id);

      this.logger.debug({message: 'Reminder Manager: removed the reminder'});
      return;
    } catch (error) {
      return this._error(error, 'An error occured while removing the reminder');
    }
  }

  /**
   * Marks a reminder as done
   *
   * @async
   * @param  {object} reminder - The reminder to mark as done
   * @return {object}
   * @throws {LovelaceError}
   */
  async markAsDone(reminder) {
    try {
      await this.validationHelper.validateId([reminder.id, reminder.account_id]);

      let entity = new ReminderEntity(this.request);
      await entity.exists(reminder.id, reminder.account_id);
      await entity.markAsDone(reminder.id, reminder.account_id);

      this.logger.debug({message: 'Reminder Manager: Marked the reminder as done'});
      return;
    } catch (error) {
      return this._error(error, 'An error occured while marking the reminder as done');
    }
  }
}

export default ReminderManager;
