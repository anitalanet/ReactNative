import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';

/**
 * Service Schema
 */

const ServiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
  categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiredAt: {
    type: Date
  },
  subscriptionTime: {
    type: String
  }
});

/**
 * - pre-post-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ServiceSchema.method({});

/**
 * Statics
 */
ServiceSchema.statics = {
  /**
   * Get service
   * @param {ObjectId} id - The objectId of service.
   * @returns {Promise<Service, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('userId')
      .populate('countryId')
      .populate('categoryId')
      .exec()
      .then((service) => {
        if (service) {
          return service;
        }
        const err = new APIError('No such service exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List services and populate userId, countryId, categotyId details.
   * @returns {Promise<Service[]>}
   */
  list() {
    return this.find()
      .populate('userId')
      .populate('countryId')
      .populate('categoryId')
      .exec();
  },

  /**
   * List servises in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of services to be skipped.
   * @param {number} limit - Limit number of services to be returned.
   * @returns {Promise<Service[]>}
   */
  lazylist({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .populate('countryId')
      .populate('categoryId')
      .exec();
  },
};

/**
 * @typedef Service
 */
export default mongoose.model('service', ServiceSchema);
