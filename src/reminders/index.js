'use strict';

import express from 'express';
import {Router} from 'lovelace-lib-express';
import ReminderController from './controller/reminder';


let router = new express.Router();

router.get('/api/reminder', ReminderController.get);
router.post('/api/reminder', ReminderController.post);
router.put('/api/reminder/:id', ReminderController.put);
router.delete('/api/reminder/:id', ReminderController.remove);
router.patch('/api/reminder/done/:id', ReminderController.markAsDone);

module.exports = router;
