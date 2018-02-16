import cron from 'cron';
import Winston from 'winston';
import mailer from 'nodemailer';
import each from 'lodash/each';
import User from '../user/user.model';
import Tender from '../tender/tender.model';
import Services from '../services/services.model';
import config from '../../config/env';
import PushNotification from '../utilServices/push-notification-services';

const logger = new (Winston.Logger)({
  transports: [
    new (Winston.transports.File)({ filename: 'logs/cron-job.log' })
  ]
});

const CronJob = cron.CronJob;

console.log('cron-job started!');//eslint-disable-line

const Cron = {

  notificationForTenderBefore7DaysOfExpiration() {
    // eslint-disable-next-line
    new CronJob('00 00 * * *', () => {
      Tender.find({
        $or: [
          { $and: [
            { expiredDate: { $lt: (new Date(new Date().setDate(new Date().getDate() + 7))) } },
            { expiredDate: { $gt: (new Date(new Date().setDate(new Date().getDate() + 6))) } }
          ] },
          { $and: [
            { expiredDate: { $lt: (new Date(new Date().setDate(new Date().getDate() + 2))) } },
            { expiredDate: { $gt: (new Date(new Date().setDate(new Date().getDate() + 1))) } }
          ] }
        ]
      })
        .populate('tenderUploader')
        .exec()
        .then((tenders) => {
          each(tenders, (tender) => {
            PushNotification.send('client.TenderExpiration', {
              operation: 'expiration',
              tenderName: tender.tenderName,
              dayRemaining: Math.trunc(Math.abs(((new Date()).getTime() - (tender.expiryDate).getTime()) / 36e5 / 24)) //eslint-disable-line
            }, {
              sender: config.supportId,
              user: tender.tenderUploader._id,
              tender: tender._id
            }, tender.tenderUploader._id);
          });
        })
        .catch((err) => {
          logger.log('error', `error while fetching the tender list error: ${err}`);
        });
    }, null, true);
  },

  deleteInActiveTender() {
    new CronJob('00 00 * * *', () => { //eslint-disable-line
      Tender.remove({
        createdAt: { $lt: (new Date(
          new Date(
            new Date(
              new Date().setHours(0)
            ).setMinutes(0)
          ).setSeconds(0)
        )) },
        isActive: false
      }).exec()
        .then((tenders) => {
          const deletedTenders = [];
          each(tenders, (tender) => {
            deletedTenders.push(tender._id);
          });
          logger.log('DeletedInActiveTenders', deletedTenders);
        });
    }, null, true);
  },

  deleteExpiredTenders() {
    new CronJob('00 00 * * *', () => { //eslint-disable-line
      Tender.find({
        expiryDate: { $lt: (new Date(
          new Date(
            new Date(
              new Date().setHours(0)
            ).setMinutes(0)
          ).setSeconds(0)
        )) },
        isActive: true
      }).exec()
        .then((tenders) => {
          const deletedTenders = [];
          each(tenders, (tender) => {
            deletedTenders.push(tender._id);
          });
          Tender.remove({ _id: { $in: deletedTenders } })
            .exec()
            .then((tenders1) => {
              logger.log('DeletedExpiredTenders', `${deletedTenders}\n${deletedTenders.length === tenders1.length}`);
            });
        }).catch((err) => {
          console.log('error while removing expired tenders', err); //eslint-disable-line
        });
    }, null, true);
  },

  deleteServiceWhenExpired() {
    new CronJob('00 00 * * *', () => {//eslint-disable-line
      Services.find({
        expiredAt: { $lt: (new Date(
          new Date(
            new Date(
              new Date().setHours(0)
            ).setMinutes(0)
          ).setSeconds(0)
        )) }
      }).exec()
        .then((services) => {
          const deletedServices = [];
          each(services, (tender) => {
            deletedServices.push(tender._id);
          });
          Services.remove({ _id: { $in: deletedServices } })
            .exec()
            .then((services1) => {
              logger.log('DeletedExpiredTenders', `${deletedServices}\n${deletedServices.length === services1.length}`);
            });
        }).catch((err) => {
          console.log('error while removing expired tenders', err); //eslint-disable-line
        });
    }, null, true);
  },

  notificationForServicesBefore7DaysOfExpiration() {
    new CronJob('58 16 * * *', () => {//eslint-disable-line
      Services.find({
        $or: [
          { $and: [
            { expiredAt: { $lt: (new Date(new Date().setDate(new Date().getDate() + 7))) } },
            { expiredAt: { $gt: (new Date(new Date().setDate(new Date().getDate() + 6))) } }
          ] },
          { $and: [
            { expiredAt: { $lt: (new Date(new Date().setDate(new Date().getDate() + 2))) } },
            { expiredAt: { $gt: (new Date(new Date().setDate(new Date().getDate() + 1))) } }
          ] }
        ]
      }).populate('userId')
        .populate('countryId')
        .populate('categoryId')
        .exec()
        .then((services) => {
          const smtpTransport = mailer.createTransport({
            service: 'Gmail',
            auth: {
              user: config.email,
              pass: config.password
            }
          });
          services.forEach((service) => {
            const catArr = [];
            const categories = service.categoryId.map(category => { //eslint-disable-line
              catArr.push(category.categoryName);
            });
            const mail = {
              from: config.email,
              to: service.userId.email,
              subject: 'Reminder: Expire Subscription ',
              html: `<html>
                       <body>
                          <div style="text-align: center;justify-content: space-around;">
                             <h3>TenderWatch</h3>
                                <p>You services <b>${catArr.join(', ')}</b> of country <b>${service.countryId.countryName}</b> is going to be expired in <b>${Math.trunc(Math.abs(((service.expiredAt).getTime() - new Date().getTime()) / 36e5 / 24))}</b> days </p>
                          </div>
                        </body>
                      </html>`
            };
            smtpTransport.sendMail(mail, (error, response) => {
              if (error) {
                console.log('error', `error while sending mail with error: ${error}`);
              } else {
                logger.log('Response', `Email sent with response: ${response}`);
                smtpTransport.close();
              }
            });

            PushNotification.send('Service.expiration', {
              serviceName: service.countryId.countryName,
              days: Math.trunc(Math.abs(((service.expiredAt).getTime() - new Date().getTime()) / 36e5 / 24)) //eslint-disable-line
            }, null, service.userId._id);
          });
        })
        .catch(err => console.log(err));
    }, null, true);
  },

  updateUserPaymentInfoAfterServiceUpdation() {
    new CronJob('*05 00 * * *', ()  => {//eslint-disable-line
      User.find({ role: 'contractor' })
        .exec()
        .then((users) => {
          each(users, (user) => {
            Services.find({ userId: user._id })
              .exec()
              .then((ser) => {
                if (ser.length === 0) {
                  user.isPayment = false;
                  user.payment = 0;
                }
                user.save();
              })
              .catch((err) => {
                console.log(err);
              });
          });
        })
        .catch(e => console.log(e));
    }, null, true);
  }
};

Cron.notificationForTenderBefore7DaysOfExpiration();
Cron.deleteInActiveTender();
Cron.deleteExpiredTenders();
Cron.deleteServiceWhenExpired();
Cron.notificationForServicesBefore7DaysOfExpiration();
Cron.updateUserPaymentInfoAfterServiceUpdation();

export default Cron;
