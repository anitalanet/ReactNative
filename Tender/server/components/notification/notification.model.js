import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';

const NotificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String
  }
});

NotificationSchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        return Promise.reject(new APIError('no such notification exist', httpStatus.NOT_FOUND));
      });
  },
  createNotification(message, recipent) {
    new this({
      user: recipent.user,
      sender: recipent.sender,
      tender: recipent.tender,
      message,
      type: recipent.type
    }).save();
  }
};

export default mongoose.model('Notification', NotificationSchema);
