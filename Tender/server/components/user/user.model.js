import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import Cryptr from 'cryptr';
import _ from 'lodash';
import APIError from '../../helpers/APIError';

const cryptr = new Cryptr('myTotalySecretKey');
/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  role: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  contactNo: {
    type: String,
    trim: true
  },
  occupation: {
    type: String,
    trim: true
  },
  aboutMe: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deviceId: [{
    type: String
  }],
  stripeDetails: {
    type: Object,
    default: {}
  },
  subscribe: {
    type: String,
    default: '0'
  },
  isPayment: {
    type: Boolean,
    default: false
  },
  payment: {
    type: Number,
    default: 0
  },
  invoiceURL: {
    type: String,
    trim: true
  }
});

/**
 * - pre-save hooks
 * - validations
 * - virtuals
 */
/* UserSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
  return next();
}); */

/**
 * Methods
 */
UserSchema.method({
  generatePassword(password) {
    return cryptr.encrypt(password);
  },
  validPassword(password) {
    return cryptr.decrypt(this.password) === password;
  },
  getPassword() {
    return cryptr.decrypt(this.password);
  },
  safeModel() {
    // const { __v, password,  ...safeUser} = this.toObject();
    return _.omit(this.toObject(), ['password', '__v']);
  },
  safeTenderUploaderModel() {
    // const { __v, password,  ...safeUser} = this.toObject();
    return _.omit(this.toObject(), ['deviceId', 'password', '__v']);
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * Get user by email
   * @param {ObjectId} email - The email of user.
   * @returns {Promise<User, APIError>}
   */
  getByEmail(email) {
    return this.findOne({ email })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  getByEmailRole(email, role) {
    //eslint-disable-next-line
    return this.findOne({ 'email': email, 'role': role })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);
