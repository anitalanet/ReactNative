import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';

function expiration() {
  const CurrentDate = new Date();
  return CurrentDate.setMonth(CurrentDate.getMonth() + 1);
}

const expiryDate = expiration;

/**
 * Tender Schema
 */
const TenderSchema = new mongoose.Schema({
  tenderUploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  city: {
    type: String
  },
  tenderName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  landlineNo: {
    type: String,
    required: false
  },
  contactNo: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  tenderPhoto: {
    type: String,
    required: false,
    default: null
  },
  expiryDate: {
    type: Date,
    default: expiryDate
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isFollowTender: {
    type: Boolean,
    default: false
  },
  disabled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readby: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  interested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  amendRead: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subscriber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

/**
 * - pre-post-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TenderSchema.method({});

/**
 * Statics
 */
TenderSchema.statics = {
  /**
   * Get tender
   * @param {ObjectId} id - The objectId of tender.
   * @returns {Promise<Tender, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('tenderUploader')
      .populate('country')
      .populate('category')
      .exec()
      .then((tender) => {
        if (!!tender) { //eslint-disable-line
          return tender;
        }
        const err = new APIError('No such tender exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      })
      .catch((err) => {
        const e = new APIError(err.message, err.status || httpStatus.BAD_REQUEST);
        return Promise.reject(e);
      });
  },

  /**
   * List tenders and populate tenderUploader details to which the tender belongs to.
   * @returns {Promise<Tender[]>}
   */
  list() {
    return this.find()
      .populate('tenderUploader')
      .populate('country')
      .populate('category')
      .exec();
  },

  /**
   * List tenders in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of tenders to be skipped.
   * @param {number} limit - Limit number of tenders to be returned.
   * @returns {Promise<Tender[]>}
   */
  lazylist({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tenderUploader')
      .populate('country')
      .populate('category')
      .exec();
  },
};

/**
 * @typedef Tender
 */
export default mongoose.model('Tender', TenderSchema);
