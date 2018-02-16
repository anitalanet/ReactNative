import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';

/**
 * Category Schema
 */
const CategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  imgString: {
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
CategorySchema.method({});

/**
 * Statics
 */
CategorySchema.statics = {
  /**
   * Get category
   * @param {ObjectId} id - The objectId of category.
   * @returns {Promise<Category, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((category) => {
        if (category) {
          return category;
        }
        const err = new APIError('No such category exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List categories in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of categories to be skipped.
   * @param {number} limit - Limit number of categories to be returned.
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
 * @typedef Category
 */
export default mongoose.model('Category', CategorySchema);
