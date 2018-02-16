import express from 'express';
import notificationCtrl from './notification.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  // api/notifcation get all unread notification.
  .get(notificationCtrl.getAll)
  // api/notifcation set all unread notification to read.
  .put(notificationCtrl.readAll);

router.route('/:notificationId')
  // api/notification/:notificationId read single notification
  .put(notificationCtrl.read);
router.route('/delete')
  // api/notification/:notificationId delete single notification
  .delete(notificationCtrl.remove);

router.param('notificationId', notificationCtrl.load);

export default router;
