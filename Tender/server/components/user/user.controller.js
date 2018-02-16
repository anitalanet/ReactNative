import httpStatus from 'http-status';
import User from './user.model';
import Review from '../review/review.model';
import config from '../../config/env';
import APIError from '../../helpers/APIError';
/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  req.user = req.user.safeTenderUploaderModel();
  req.user.profilePhoto = req.user.profilePhoto ? `${config.s3_url}/profileimages/${req.user.profilePhoto}` : 'no image'
  Review.avgReview(req.user._id)
    .then((review) => {
      req.user.avg = parseFloat(review);
      Review.onetoone({ user: req.user._id, reviewer: res.locals.session._id })
        .then((one) => {
          if (one) {
            req.user.review = {
              _id: one._id,
              rating: one.rating
            };
            return res.json(req.user);
          }
          req.user.review = {
            _id: 'no id',
            rating: 0
          };
          return res.json(req.user);
        })
        .catch(() => {
          req.user.review = {
            _id: 'no id',
            rating: 0
          };
          return res.json(req.user.safeTenderUploaderModel());
        });
    })
    .catch(() => {
      req.user.avg = 0;
      req.user.review = 0;
      return res.json(req.user.safeTenderUploaderModel());
    });
}

/**
 * Get user profile of logged in user
 * @returns {User}
 */
function getProfile(req, res, next) {
  User.get(res.locals.session._id)
    .then(user => res.json(user.safeModel()))
    .catch(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.firstName - The firstName of user.
 * @property {string} req.body.lastName - The lastName of user.
 * @property {string} req.body.profilePhoto - The profilePhoto of user.
 * @property {string} req.body.country - The country of user.
 * @property {string} req.body.contactNo - The contactNo of user.
 * @property {string} req.body.occupation - The occupation of user.
 * @property {string} req.body.aboutMe - The aboutMe of user.
 * @returns {User}
 */
function update(req, res, next) {
  const userDate = req.user;

  let imageName;
  if (req.file) {
    imageName = `image_${req.file.key.split('image_')[1]}`;
  }

  userDate.profilePhoto = imageName || `image_${userDate.profilePhoto.split('image_')[1]}`;
  userDate.country = req.body.country || userDate.country;
  userDate.contactNo = req.body.contactNo || userDate.contactNo;
  userDate.occupation = req.body.occupation || userDate.occupation;
  userDate.aboutMe = req.body.aboutMe || userDate.aboutMe;

  userDate.save()
    .then((savedUser) => {
      const user = savedUser.safeModel();
      user.profilePhoto = user.profilePhoto ? `${config.s3_url}/profileimages/${user.profilePhoto}` : 'no image';
      res.json(user);
    })
    .catch(e => next(e));
}

function changePassword(req, res) {
  const user = req.user;
  if (user.validPassword(req.body.oldPassword)) {
    user.password = user.generatePassword(req.body.newPassword);
    User.findOneAndUpdate(
      { email: user.email },
      { $set: { password: user.password } }, (err) => {
        if (err) {
          console.log(err);
        } else {
          res.send({ message: 'Password changed successfully!!!' });
        }
      });
  } else {
    res.send({ message: 'Old password is wrong!!!' });
  }
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser.safeModel()))
    .catch(e => next(e));
}

function logout(req, res, next) {
  User.findOneAndUpdate(
    {
      _id: res.locals.session._id,
      deviceId: req.body.deviceId,
      role: req.body.role || res.locals.session.role
    },
    { $pull: { deviceId: req.body.deviceId } },
    { upsert: true, new: true }
  )
    .exec()
    .then(() => {
      res.sendStatus(httpStatus.OK);
    }).catch(() => {
      next(new APIError('error while updating the user\'s device list', httpStatus.NOT_MODIFIED, true));
    });
}

export default { load, get, getProfile, update, list, remove, changePassword, logout };
