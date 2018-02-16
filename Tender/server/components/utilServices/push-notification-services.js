import apn from 'apn';
import Winston from 'winston';
import { each } from 'lodash';
import User from '../user/user.model';
import config from '../../config/env';
import Notification from '../notification/notification.model';

const logger = new (Winston.Logger)({
  transports: [
    new (Winston.transports.File)({ filename: 'logs/push-notifications.log' })
  ]
});
const apnProvider = new apn.Provider(config.apn);

const notificationText = {
  /* eslint-disable */
  'Contractor.newTender': 'New Tender "${tenderName}" available in your specified service Go get your opportunity.',
  'client.TenderExpiration': 'User your tender "${tenderName}" is gone expired in ${dayRemaining} days.',
  'client.ContractorInterested': '${email} is interested in your tender "${tenderName}".',
  'Contractor.tenderDeleted': '${email} has ${operation} the tender "${tenderName}".',
  'Service.expiration': 'your service of country "${serviceName}" is going to be expired in ${days} days.'
  /* eslint-enable */
};

function getNotification(notification) {
  return notificationText[notification];
}

function insertParameters(notification, params) {
  each(params, (param, key) => {
    // eslint-disable-next-line
    notification = notification.replace(`\${${key}}`, param);
  });
  return notification;
}

function build(notification, param, userId) {
  return new Promise(
    (resolve) => {
      const _notification = getNotification(notification);
      const note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600;
      note.alert = insertParameters(_notification, param);
      note.sound = 'default';
      note.contentAvailable = true;
      note.payload = { };
      if (param.operation !== null && param.operation !== undefined) { //eslint-disable-line
        note.payload.notificationType = param.operation;//eslint-disable-line
      }
      if (param.operation === 'interested') {
        note['category'] = 'Contractor_Detail'; //eslint-disable-line
      }
      note.topic = 'com.tenderWatch';
      Notification.find({ user: userId, read: false })
        .count()
        .exec()
        .then((count) => {
          note.badge = count;
          return resolve(note);
        });
    }
  );
}

function send(notification, param, local, user) {
  if (!!local) { //eslint-disable-line
    Notification.createNotification(insertParameters(getNotification(notification), param), {
      sender: local.sender,
      user: local.user,
      tender: local.tender,
      type: param.operation
    });
  }
  User.get(user)
    .then((founduser) => {
      if (founduser.deviceId) {
        if (founduser.deviceId.length > 0) {
          build(notification, param, founduser._id)
            .then((notificationPayload) => {
              apnProvider.send(notificationPayload, founduser.deviceId, (data) => {
                logger.log('error', `Failed to send Notification to ${founduser.email} with error ${data.failed}`);
                logger.log('info', `Notification sent to ${founduser.email} with result ${data.sent}`);
              });

              // apnProvider.shutdown();
            });
        } else {
          logger.log('warn', `user ${founduser.email} not have assigned deviceId to account.`);
        }
      }
    })
    .catch((err) => {
      logger.log('error', `error while fetching the user for id: ${user} with error: ${err}`);
    });
}

export default { send };
