import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';

/**
 * Country Schema
 */
const CountrySchema = new mongoose.Schema({
  countryName: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  isoCode: {
    type: String,
    required: true,
  },
  isoCurrencyCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  imageString: {
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
CountrySchema.method({});

/**
 * Statics
 */
CountrySchema.statics = {
  /**
   * Get country
   * @param {ObjectId} id - The objectId of country.
   * @returns {Promise<Country, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((country) => {
        if (country) {
          return country;
        }
        const err = new APIError('No such country exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List countries in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of countries to be skipped.
   * @param {number} limit - Limit number of countries to be returned.
   * @returns {Promise<Country[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },
};

/**
 * @typedef Country
 */
export default mongoose.model('Country', CountrySchema);
