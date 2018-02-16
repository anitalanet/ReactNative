import mongoose from 'mongoose';
import Promise from 'bluebird';
import { each } from 'lodash';
import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.statics = {
  get(id) {
    return this.findById(id)
      .then((review) => {
        if (review) {
          return review;
        }
        return Promise.reject(new APIError('no such notification exist', httpStatus.NOT_FOUND));
      })
      .catch(err => Promise.reject(new APIError(httpStatus.BAD_REQUEST, err.message)));
  },
  avgReview(id) {
    return this.find({ user: id })
      .then((reviews) => {
        if (reviews.length > 0) {
          let total = 0;
          each(reviews, (review) => {
            total += review.rating;
          });
          return (total / reviews.length).toFixed(1);
        }
        return 0;
      })
      .catch(err => Promise.reject(new APIError(httpStatus.BAD_REQUEST, err.message)));
  },
  onetoone(map) {
    return this.findOne({ user: map.user, reviewer: map.reviewer })
      .then((review) => {
        if (review) {
          return review;
        }
        return 0;
      })
      .catch(err => Promise.reject(new APIError(httpStatus.BAD_REQUEST, err.message)));
  }
};

export default mongoose.model('Review', reviewSchema);
