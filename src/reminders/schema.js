'use strict';

import Joi from 'lovelace-lib-joi';
import constants from 'lovelace-lib-constants';

const reminder = Joi.object().keys({
  id: Joi.number().integer().min(1).max(constants.TENLAKH).optional(),
  description: Joi.string().min(1).max(2047),
  customer_id: Joi.number().integer().min(1).max(constants.TENLAKH).allow(null),
  datetime: Joi.mysql().datetime(),
  is_done: Joi.boolean().truthy(1, '1').falsy(0, '0'),
  account_id: Joi.number().integer().min(1).max(constants.TENLAKH)
}).requiredKeys('description', 'datetime', 'is_done');

export default reminder;
