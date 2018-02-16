import httpStatus from 'http-status';
import Review from './review.model';
import APIError from '../../helpers/APIError';

function load(req, res, next, id) {
  Review.get(id)
    .then((review) => {
      req.review = review;
      return next();
    })
    .catch(e => next(e));
}

function add(req, res, next) {
  req.body.reviewer = res.locals.session._id;
  const review = new Review(req.body);
  review.save()
    .then((addedReview) => {
      Review.avgReview(review.user)
        .then((avg) => {
          res.send({ _id: addedReview._id, rating: addedReview.rating, avg: parseFloat(avg) });
        });
    })
    .catch(err => next(new APIError(httpStatus.INTERNAL_SERVER_ERROR, err.message)));
}

function getAll(req, res, next) {
  return Review.find({ user: res.locals.session._id })
    .populate('reviewer')
    .populate('user')
    .sort('-created')
    .exec()
    .then((reviews) => {
      if (reviews.length > 0) return res.json(reviews);
      return next(new APIError(httpStatus.NOT_FOUND, 'no reviews found for user'));
    })
    .catch(err => next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR)));
}

function remove(req, res, next) {
  req.review.remove()
    .then(() => res.sendStatus(httpStatus.ACCEPTED))
    .catch(err => next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR)));
}

function update(req, res, next) {
  req.review.rating = req.body.rating || req.review.rating;
  req.review.created = Date.now();
  req.review.save()
    .then((review) => {
      Review.avgReview(review.user)
        .then(avg => res.send({ _id: review._id, rating: review.rating, avg: parseFloat(avg) }));
    })
    .catch(err => next(new APIError(httpStatus.INTERNAL_SERVER_ERROR, err.message)));
}

export default { load, add, getAll, remove, update };
