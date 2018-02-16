import express from 'express';
import reviewCtrl from './review.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
// api/review add review for user
  .post(reviewCtrl.add)
  // api/review get all unread notification.
  .get(reviewCtrl.getAll);

router.route('/:reviewId')
// api/review/:reviewId read single review
  .put(reviewCtrl.update)
  // api/review/:reviewId delete single review
  .delete(reviewCtrl.remove);

router.param('reviewId', reviewCtrl.load);
export default router;
