import httpStatus from 'http-status';
import { each, map, omit } from 'lodash';
import PushNotification from '../utilServices/push-notification-services';
import APIError from '../../helpers/APIError';
import Tender from './tender.model';
import Service from '../services/services.model';
import config from '../../config/env';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

/**
 * Load tender and append to req.
 */
function load(req, res, next, id) { // eslint-disable-line
  Tender.get(id)
    .then((tender) => {
      req.tender = tender;
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get tender
 * @returns {Tender}
 */
function get(req, res, next) {
  if (res.locals.session.role === 'client') {
    if (res.locals.session._id === req.tender.tenderUploader._id.toString()) {
      req.tender.tenderUploader = req.tender.tenderUploader.safeTenderUploaderModel();
      req.tender.tenderPhoto = req.tender.tenderPhoto ? `${config.s3_url}/tenderimages/${req.tender.tenderPhoto}` : 'no image';
      req.tender.tenderUploader.profilePhoto = req.tender.tenderUploader.profilePhoto ? `${config.s3_url}/profileimages/${req.tender.tenderUploader.profilePhoto}` : 'no image';
      return res.json(req.tender);
    }
    return next(new APIError('client not allowed to fetch other client\'s tender', httpStatus.UNAUTHORIZED));
  }
  if (req.tender.readby.indexOf(res.locals.session._id) === -1) {
    req.tender.readby.push(res.locals.session._id);
  }
  if (req.tender.amendRead) {
    if (req.tender.amendRead.indexOf(res.locals.session._id) === -1) {
      req.tender.amendRead.push(res.locals.session._id);
    }
  }
  return req.tender.save().then((resTender) => {
    resTender.tenderUploader = resTender.tenderUploader.safeTenderUploaderModel();
    resTender.tenderPhoto = resTender.tenderPhoto ? `${config.s3_url}/tenderimages/${resTender.tenderPhoto}` : 'no image';
    resTender.tenderUploader.profilePhoto = resTender.tenderUploader.profilePhoto ? `${config.s3_url}/profileimages/${resTender.tenderUploader.profilePhoto}` : 'no image';
    req.tender = resTender;
    return res.json(req.tender);
  });
}

/**
 * Get favorite tenders of current logged in user which is client
 * @returns {Tender[]}
 */

function getFavorite(req, res) { // eslint-disable-line
  if (res.locals.session.role === 'contractor') {
    return Tender.find({
      favorite: res.locals.session._id,
      disabled: { $ne: res.locals.session._id } })
      .populate('tenderUploader')
      .sort('-expiryDate')
      .exec()
      .then((tenders) => {
        if (tenders) {
          if (tenders.length === 0) {
            return res.json({ message: 'no tenders for user' });
          }
          tenders = map(tenders, (tender) => {
            tender = tender.toObject();
            tender.tenderUploader = omit(tender.tenderUploader, ['deviceId', 'password', '__v']);
            tender.tenderUploader.profilePhoto = tender.tenderUploader.profilePhoto ? `${config.s3_url}/profileimages/${tender.tenderUploader.profilePhoto}` : 'no image';
            tender.tenderPhoto = tender.tenderPhoto ? `${config.s3_url}/tenderimages/${tender.tenderPhoto}` : 'no image';
            return tender;
          });
          return res.json(tenders);
        }
        return res.status(404).send({ message: 'no tenders for user' });
      })
      .catch((err) => {
        const error = {
          errorType: 'ErrorRetrivingTenders',
          errorMessage: `Error while retriving user's tenders with error: ${err}`
        };
        return res.status(404).send(error);
      });
  }
  return res.status(httpStatus.UNAUTHORIZED).send({
    message: 'client is not authorized to fetch favorite tender list'
  });
}

/**
 * Get tenders of current logged in user which is client
 * @returns {Tender[]}
 */
function getTenders(req, res) { // eslint-disable-line
  if (res.locals.session.role === 'client') {
    return Tender.find({ tenderUploader: res.locals.session._id, isActive: true })
      .sort('-expiryDate')
      .exec()
      .then((tenders) => {
        if (tenders) {
          if (tenders.length === 0) {
            return res.json({ message: 'no tenders for user' });
          }
          each(tenders, (tender) => {
            tender.tenderPhoto = tender.tenderPhoto ? `${config.s3_url}/tenderimages/${tender.tenderPhoto}` : 'no image';
          });
          return res.json(tenders);
        }
        return res.status(404).send({ message: 'no tenders for user' });
      })
      .catch((err) => {
        res.status(404).send({
          errorType: 'ErrorRetrivingTenders',
          errorMessage: `Error while retriving user's tenders with error: ${err}`
        });
      });
  } else if (res.locals.session.role === 'contractor') {
    return Service.find({ userId: res.locals.session._id })
      .exec()
      .then((service) => {
        const condition = [];
        service.forEach((ser) => {
          ser.categoryId.forEach((categories) => {
            condition.push({ country: ser.countryId, category: categories });
          });
        });

        if (condition.length > 0) {
          return Tender.find({
            $or: condition,
            disabled: { $ne: res.locals.session._id }
          })
            .populate('tenderUploader')
            .sort('-expiryDate')
            .exec()
            .then((tenders) => {
              if (tenders.length > 0) {
                tenders = map(tenders, (tender) => {
                  tender = tender.toObject();
                  tender.tenderUploader = omit(tender.tenderUploader, ['deviceId', 'password', '__v']);
                  tender.tenderUploader.profilePhoto = tender.tenderUploader.profilePhoto ? `${config.s3_url}/profileimages/${tender.tenderUploader.profilePhoto}` : 'no image';
                  tender.tenderPhoto = tender.tenderPhoto ? `${config.s3_url}/tenderimages/${tender.tenderPhoto}` : 'no image';
                  return tender;
                });
                return res.json(tenders);
              }
              return res.status(404).send({ message: 'no tenders for user' });
            });
        }
        return res.status(httpStatus.NOT_FOUND).json({ message: 'no contract available' });
      });
  }
  return res.status(404).send({ message: `${res.locals.session.role} is not allowed to fetch tender list` });
}

/**
 * Create new tender
 * @property {string} req.body.tenderName - The name of tender.
 * @returns {Tender}
 */
function create(req, res, next) {
  const tender = new Tender(req.body);
  tender.amendRead = null;
  tender.tenderUploader = res.locals.session._id;
  if (req.file) {
    tender.tenderPhoto = `image_${req.file.key.split('image_')[1]}`;
  }

  tender.save()
    .then((savedTender) => {
      res.json(savedTender);
      Service.find({ countryId: savedTender.country, categoryId: savedTender.category })
        .select('userId')
        .exec()
        .then((services) => {
          each(services, (service) => {
            PushNotification.send('Contractor.newTender', {
              tenderName: savedTender.tenderName,
              operation: 'upload'
            }, {
              sender: res.locals.session._id,
              user: service.userId,
              tender: savedTender._id
            }, service.userId);
          });
        });
    })
    .catch(e => next(e));
}

/**
 * Update existing tender
 * @property {string} req.body.tenderName - The name of tender.
 * @returns {Tender}
 */
function update(req, res, next) {
  const tender = req.tender;
  tender.country = req.body.country || tender.country;
  tender.category = req.body.category || tender.category;
  tender.tenderName = req.body.tenderName || tender.tenderName;
  tender.description = req.body.description || tender.description;
  tender.email = req.body.email || tender.email;
  tender.landlineNo = req.body.landlineNo || tender.landlineNo;
  tender.contactNo = req.body.contactNo || tender.contactNo;
  tender.address = req.body.address || tender.address;
  tender.expiryDate = req.body.expiryDate || tender.expiryDate;
  // if (req.body.isFollowTender !== undefined) {
  //   tender.isFollowTender = req.body.isFollowTender;
  //   if (typeof tender.isFollowTender === 'string' && tender.isFollowTender === 'true') {
  //     tender.isFollowTender = true;
  //   } else {
  //     tender.isFollowTender = false;
  //   }
  // }
  tender.isFollowTender = req.body.isFollowTender;
  tender.amendRead = [];
  //eslint-disable-next-line
  tender.tenderPhoto = req.file ? `image_${req.file.key.split('image_')[1]}` : tender.tenderPhoto;
  tender.save()
      .then((savedTender) => {
        Service.find({ countryId: savedTender.country, categoryId: savedTender.category })
          .select('userId')
          .exec()
          .then((services) => {
            each(services, (service) => {
              PushNotification.send('Contractor.tenderDeleted', {
                tenderName: savedTender.tenderName,
                operation: 'amended',
                email: res.locals.session.email
              }, {
                sender: res.locals.session._id,
                user: service.userId,
                tender: savedTender._id
              }, service.userId);
            });
          });
        savedTender.tenderPhoto = savedTender.tenderPhoto ? `${config.s3_url}/tenderimages/${tender.tenderPhoto}` : 'no image';
        res.json(savedTender);
      })
      .catch(e => next(new APIError(e.message, httpStatus.CONFLICT, true)));
}

/**
 * Get tender list.
 * @returns {Tender[]}
 */
function list(req, res, next) { // eslint-disable-line
  Tender.list()
    .then(tenders => res.json(tenders))
    .catch(e => next(e));
}

/**
 * Delete tender.
 * @returns {Tender}
 */
function remove(req, res, next) {
  const tender = req.tender;
  if (res.locals.session.role === 'client') {
    tender.createdAt = new Date(
      new Date(
        new Date(
          new Date(
            new Date().setDate(new Date().getDate() + 7)
          ).setHours(0)
        ).setMinutes(0)
      ).setSeconds(0));
    tender.isActive = false;
    tender.save()
      .then((deletedTender) => {
        Service.find({ countryId: deletedTender.country, categoryId: deletedTender.category })
          .select('userId')
          .exec()
          .then((services) => {
            each(services, (service) => {
              PushNotification.send('Contractor.tenderDeleted', {
                tenderName: deletedTender.tenderName,
                operation: 'deleted',
                email: res.locals.session.email
              }, {
                sender: res.locals.session._id,
                user: service.userId,
                tender: deletedTender._id
              }, service.userId);
            });
          });
        res.json(deletedTender);
      })
      .catch(e => next(e));
  } else if (!tender.disabled.includes(res.locals.session._id)) {
    tender.disabled.push(res.locals.session._id);
    // tender.favorite.splice(tender.favorite.indexOf(res.locals.session._id), 1);
    tender.save()
        .then(() => {
          res.sendStatus(200);
        })
        .catch(() => {
          next(new APIError('no tender found', httpStatus.NO_CONTENT, true));
        });
  } else {
    next(new APIError('you have already disabled the tender', httpStatus.NOT_MODIFIED, true));
  }
}

/**
 *  Add tender as Favorite to user.
 *  @return {Tender}
 */
function addFavorite(req, res, next) {
  if (res.locals.session.role === 'contractor') {
    return Tender.findOneAndUpdate({
      _id: req.params.favTenderId,
      favorite: { $ne: res.locals.session._id } },
      { $push: { favorite: res.locals.session._id } },
      { upsert: true, new: true })
      .populate('tenderUploader')
      .exec()
      .then((tender) => {
        if (tender) {
          tender.tenderUploader.profilePhoto = tender.tenderUploader.profilePhoto ? `${config.s3_url}/profileimages/${tender.tenderUploader.profilePhoto}` : 'no image';
          if (tender.subscriber) tender.subscriber.profilePhoto = tender.subscriber.profilePhoto ? `${config.s3_url}/profileimages/${tender.subscriber.profilePhoto}` : 'no image';
          if (tender.favorite.length > 0) {
            each(tender.favorite, (user, key) => {
              tender.favorite[key].profilePhoto = tender.favorite[key].profilePhoto ? `${config.s3_url}/profileimages/${user.profilePhoto}` : 'no image';
            });
          }
          res.status(httpStatus.ACCEPTED).json(tender);
        } else {
          res.status(httpStatus.NO_CONTENT);
        }
      })
      .catch((err) => {
        next(new APIError(err.message, httpStatus.CONFLICT, true));
      });
  }
  return next(new APIError('client can not have the favorites', httpStatus.UNAUTHORIZED, true));
}

/**
 *  remove tender as Favorite for user.
 *  @return {success}
 */
function deleteFavorite(req, res, next) {
  if (res.locals.session.role === 'contractor') {
    return Tender.findOneAndUpdate({
      _id: req.params.favTenderId,
      favorite: res.locals.session._id
    },
      { $pull: { favorite: res.locals.session._id } },
      { upsert: true, new: true })
      .exec()
      .then((tender) => {
        if (tender) {
          return res.sendStatus(httpStatus.ACCEPTED);
        }
        return res.sendStatus(httpStatus.NO_CONTENT);
      })
      .catch((err) => {
        next(new APIError(err.message, httpStatus.CONFLICT, true));
      });
  }
  return next(new APIError('client can not have the favorites', httpStatus.UNAUTHORIZED, true));
}

function addInterested(req, res, next) {
  if (req.tender.interested.indexOf(res.locals.session._id) === -1) {
    req.tender.tenderUploader = req.tender.tenderUploader._id;
    req.tender.interested.push(res.locals.session._id);
    return req.tender.save()
      .then((updatedTender) => {
        PushNotification.send('client.ContractorInterested', {
          tenderName: updatedTender.tenderName,
          email: res.locals.session.email,
          operation: 'interested'
        }, {
          sender: res.locals.session._id,
          user: updatedTender.tenderUploader,
          tender: updatedTender._id
        }, updatedTender.tenderUploader);
        res.sendStatus(httpStatus.OK);
      })
      .catch(err => next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true)));
  }
  return next(new APIError('you are already interested in tender', httpStatus.NOT_MODIFIED, true));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  getTenders,
  getFavorite,
  addFavorite,
  deleteFavorite,
  addInterested
};
