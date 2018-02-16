import express from 'express';
import supportCtrl from './support.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
// api/notifcation get all unread notification.
  .post(supportCtrl.sendSupportMail);

export default router;
