import httpStatus from 'http-status';
import { filter, map, omit } from 'lodash';
import Notification from './notification.model';
import User from '../user/user.model';
import config from '../../config/env';
import APIError from '../../helpers/APIError';

function load(req, res, next, id) {
  Notification.get(id)
    .then((notification) => {
      req.notification = notification;
      return next();
    })
    .catch(e => next(e));
}

function readAll(req, res, next) {
  return Notification.update({ user: res.locals.session._id },
    { read: true },
    { upsert: true, multi: true })
    .exec()
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR)));
}

function read(req, res, next) {
  req.notification.read = true;
  req.notification.save()
    .then((notification) => {
      if (notification.read) {
        return res.sendStatus(httpStatus.OK);
      }
      return res.json(new APIError('cannot mark notification as read', httpStatus.NOT_MODIFIED));
    })
    .catch(e => next(new APIError(e.message, httpStatus.INTERNAL_SERVER_ERROR)));
}

function getAll(req, res, next) {
  return Notification.find({ user: res.locals.session._id })
    .populate('sender')
    .populate('user')
    .populate('tender')
    .sort('-createdAt')
    .exec()
    .then((notifications) => {
      if (notifications) {
        notifications = filter(notifications, (notification) => {
          notification = notification.toObject();
          return (notification.sender && notification.tender);
        });
        notifications = map(notifications, (notification) => {
          notification = notification.toObject();
          notification.user.profilePhoto = (notification.user.profilePhoto && `${config.s3_url}/profileimages/${notification.user.profilePhoto}`) || 'no image';
          notification.sender.profilePhoto = (notification.sender.profilePhoto && `${config.s3_url}/profileimages/${notification.sender.profilePhoto}`) || 'no image';
          notification.tender.tenderPhoto = (notification.tender.tenderPhoto && `${config.s3_url}/tenderimages/${notification.tender.tenderPhoto}`) || 'no image';
          notification.user = omit(notification.user, ['deviceId', 'password', '__v']);
          notification.sender = omit(notification.sender, ['deviceId', 'password', '__v']);
          return notification;
        });
        return res.json(notifications);
      }
      return next(new APIError('no new notifications', httpStatus.NO_CONTENT));
    })
    .catch(err => next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR)));
}

function remove(req, res, next) {
  // req.notification.read = true;
  // req.notification.save()
  //   .then((notification) => {
  //     if (notification.read) {
  //       return res.sendStatus(httpStatus.OK);
  //     }
  //     return res.json(new APIError('cannot mark notification as read', httpStatus.NOT_MODIFIED));
  //   })
  //   .catch(e => next(new APIError(e.message, httpStatus.INTERNAL_SERVER_ERROR)));
  Notification.remove({ _id: { $in: req.body.notification } })
    .exec()
    .then(() => res.sendStatus(httpStatus.ACCEPTED))
    .catch(err => next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR)));
}

export default { load, read, getAll, remove, readAll };
