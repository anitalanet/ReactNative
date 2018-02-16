import httpStatus from 'http-status';
import mailer from 'nodemailer';
import Invoice from 'nodeice';
import fs from 'fs';
import Winston from 'winston';
import AWS from 'aws-sdk';
import { each } from 'lodash';
import APIError from '../../helpers/APIError';
import User from '../user/user.model';
import Service from './services.model';
import config from '../../config/env';

/**
 * Load service and append to req.
 */

const logger = new (Winston.Logger)({
  transports: [
    new (Winston.transports.File)({ filename: 'logs/sent-email.log' })
  ]
});

function load(req, res, next, id) {
  Service.get(id)
    .then((service) => {
      req.service = service; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get service
 * @returns {Service}
 */
function get(req, res) {
  return res.json(req.service);
}

/**
 * Create new service
 * @property {string} req.body.userId - The id of user.
 * @returns {Service}
 */
function create(req, res, next) {
  const services = [];
  const serviceRes = {};
  each(req.body.selections, (value, key) => {
    services.push({
      userId: res.locals.session._id,
      countryId: key,
      categoryId: value
    });
  });

  Service.create(services, (err, createdServices) => {
    if (err) {
      next(new APIError('Error while creating user\'s service', httpStatus.NOT_MODIFIED, true));
    }
    if (createdServices) {
      each(createdServices, (service) => {
        serviceRes[service.countryId] = service.categoryId;
      });
      res.json(serviceRes);
    }
  });
}

/**
 * Update existing service
 * @property {string} req.body.userId - The id of user.
 * @returns {Service}
 */
function update(req, res, next) {
  const service = req.service;
  service.userId = req.body.userId || service.userId;
  service.countryId = req.body.countryId || service.countryId;
  service.categoryId = req.body.categoryId || service.categoryId;
  service.save()
    .then(savedService => res.json(savedService))
    .catch(e => next(new APIError(e.message, httpStatus.CONFLICT, true)));
}

/**
 * Get service list.
 * @returns {Service[]}
 */
function list(req, res, next) {
  Service.list()
    .then(services => res.json(services))
    .catch(e => next(e));
}

/**
 * Delete service.
 * @returns {Service}
 */
function remove(req, res, next) {
  const service = req.service;
  service.remove()
    .then(deletedService => res.json(deletedService))
    .catch(e => next(e));
}


/**
 * Get all services of current logged in user
 * @returns {[]}
 */
function userServices(req, res, next) {
  let cndn = {};
  if (req.body.countries) {
    cndn = { userId: res.locals.session._id, countryId: { $in: req.body.countries } };
  } else {
    cndn = { userId: res.locals.session._id };
  }
  return Service.find(cndn)
    .exec()
    .then((service) => {
      if (service) {
        const serviceArr = [];
        each(service, (ser) => {
          // services = {};
          // services[ser.countryId] = ser.categoryId;
          // services.create = ser.createdAt;
          serviceArr.push(ser);
        });
        return res.json(serviceArr).status(httpStatus.OK);
      }
      return next(new APIError('No Services found for User', httpStatus.NO_CONTENT, true));
    })
    .catch((err) => {
      next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true));
    });
}


/**
 * Updates the userServices and Get all services of current logged in user
 * @returns {[]}
 */
function updateUserServices(req, res, next) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((foundUser) => {//eslint-disable-line
      if (foundUser.isPayment) {
        foundUser.payment += req.body.payment;
        if (foundUser.subscribe === '1') {
          foundUser.subscribe = req.body.subscribe;
        }
        foundUser.save()
          .then((user) => {
            console.log(foundUser);
            const newServices = [];
            each(req.body.selections, (value, key) => {
              const CurrentDate = new Date();
              newServices.push({
                userId: res.locals.session._id,
                countryId: key,
                categoryId: value,
                subscriptionTime: req.body.subscribe,
                expiredAt: req.body.subscribe === '3' ? new Date(new Date(new Date(new Date(CurrentDate.setYear(CurrentDate.getYear() + 1901)).setHours(0)).setMinutes(0)).setSeconds(0)) : new Date(new Date(new Date(new Date(CurrentDate.setMonth(CurrentDate.getMonth() + 1)).setHours(0)).setMinutes(0)).setSeconds(0))
              });
            });

            return Service.create(newServices)
              .then((updateServices) => {
                invoiceCreateForEmail(updateServices, res.locals.session);

                Service.find({ userId: user._id })
                  .populate('userId')
                  .populate('countryId')
                  .populate('categoryId')
                  .sort('-createdAt')
                  .exec()
                  .then((services) => {
                    let tasks = [];
                    if (services.length > 0) {
                      tasks = services.map((service) => {
                        const dict = {};
                        const catArr = [];
                        const categories = service.categoryId.map(category => { //eslint-disable-line
                          const catDict = {};
                          catDict.categoryName = category.categoryName;
                          catDict.categoryImage = `data:image/png;base64,${category.imgString}`;
                          catArr.push(catDict);
                        });
                        dict.countryName = service.countryId.countryName;
                        dict.countryImage = `data:image/jpeg;base64,${service.countryId.imageString}`;
                        return {
                          country: dict,
                          category: catArr,
                          unit: service.subscriptionTime === '1' ? 'Free Trial' : service.subscriptionTime === '2' ? 'Monthly' : 'Yearly', //eslint-disable-line
                          quantity: service.categoryId.length,
                          unitPrice: service.subscriptionTime === '1' ? 0 : service.subscriptionTime === '2' ? 15 : 120, //eslint-disable-line
                          expiredDate: `${service.expiredAt.getDate()}-${service.expiredAt.getMonth() + 1}-${service.expiredAt.getFullYear()}`
                        };
                      });
                      const myInvoice = new Invoice({
                        config: {
                          template: 'server/components/services/invoice.html',
                          tableRowBlock: 'server/components/services/invoiceRow.html'
                        },
                        data: {
                          currencyBalance: {
                            main: 1,
                          },
                          invoice: {
                            number: {
                              id: Date.now()
                            },
                            date: Date(),
                            explanation: 'Thank you for your business!',
                            currency: {
                              main: 'USD',
                            }
                          },
                          tasks
                        },
                        seller: {
                          company: 'TenderWatch Ltd.',
                          address: {
                            street: 'Ground floor, Morani House',
                            city: 'Maktaba Street - Dar es Salaam',
                            country: 'Tanzania',
                            zip: 'P.O. Box 21017'
                          },
                          phone: '+255 22 2127242 / 3',
                          email: ' info@tenderwatch.com',
                          website: 'www.tenderwatch.com',
                        },
                        buyer: {
                          company: user.email,
                          address: {
                            street: 'Kalenga street',
                            number: '23',
                            zip: '000000',
                            city: 'Dar es Salaam',
                            country: 'Tanzania'
                          },
                          phone: user.contactNo,
                          email: user.email,
                          website: 'tenderwatch.com',
                        }
                      });
                      myInvoice.toPdf('server/components/services/invoiceUser.pdf', (err1, data1) => {//eslint-disable-line

                        fs.readFile('server/components/services/invoiceUser.pdf', (err, data) => {
                          if (err) throw err;
                          const key = `invoice${user._id}.pdf`;
                          const params = {
                            Bucket: 'tenderwatch/Billing',
                            Key: key,
                            ACL: 'public-read',
                            Body: data
                          };

                          AWS.config.loadFromPath('./server/aws-config.json');
                          const s3 = new AWS.S3();

                          s3.putObject(params, (perr, pres) => {//eslint-disable-line
                            if (perr) {
                              res.send(httpStatus.NOT_FOUND);
                            } else {
                              user.invoiceURL = `${config.s3_url}/Billing/${key}`;
                              user.save()
                                .then(() => {
                                  res.status(httpStatus.OK).send({ url: `${config.s3_url}/Billing/${key}` });
                                });
                            }
                          });
                        });
                      });
                    } else {
                      res.status(httpStatus.NOT_FOUND);
                    }
                  });
              })
              .catch((err) => {
                next(new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true));
              });
          });
      } else {
        foundUser.payment = req.body.payment;
        foundUser.isPayment = true;
        if (foundUser.subscribe === '1') {
          foundUser.subscribe = req.body.subscribe;
        }
        return foundUser.save()
          .then((user) => {
            Service.find({ userId: user._id })
              .populate('userId')
              .populate('countryId')
              .populate('categoryId')
              .sort('-createdAt')
              .exec()
              .then((services) => {
                let tasks = [];
                if (services.length > 0) {
                  tasks = services.map((service) => {
                    const dict = {};
                    const catArr = [];
                    const categories = service.categoryId.map(category => { //eslint-disable-line
                      const catDict = {};
                      catDict.categoryName = category.categoryName;
                      catDict.categoryImage = `data:image/png;base64,${category.imgString}`;
                      catArr.push(catDict);
                    });
                    dict.countryName = service.countryId.countryName;
                    dict.countryImage = `data:image/jpeg;base64,${service.countryId.imageString}`;
                    return {
                      country: dict,
                      category: catArr,
                      unit: service.subscriptionTime === '1' ? 'Free Trial' : service.subscriptionTime === '2' ? 'Monthly' : 'Yearly',//eslint-disable-line
                      quantity: service.categoryId.length,
                      unitPrice: service.subscriptionTime === '1' ? 0 : service.subscriptionTime === '2' ? 15 : 120,//eslint-disable-line
                      expiredDate: `${service.expiredAt.getDate()}-${service.expiredAt.getMonth() + 1}-${service.expiredAt.getFullYear()}`
                    };
                  });
                  const myInvoice = new Invoice({
                    config: {
                      template: 'server/components/services/invoice.html',
                      tableRowBlock: 'server/components/services/invoiceRow.html'
                    },
                    data: {
                      currencyBalance: {
                        main: 1,
                      },
                      invoice: {
                        number: {
                          id: Date.now()
                        },
                        date: Date(),
                        explanation: 'Thank you for your business!',
                        currency: {
                          main: 'USD',
                        }
                      },
                      tasks
                    },
                    seller: {
                      company: 'TenderWatch Ltd.',
                      address: {
                        street: 'Ground floor, Morani House',
                        city: 'Maktaba Street - Dar es Salaam',
                        country: 'Tanzania',
                        zip: 'P.O. Box 21017'
                      },
                      phone: '+255 22 2127242 / 3',
                      email: ' info@tenderwatch.com',
                      website: 'www.tenderwatch.com',
                    },
                    buyer: {
                      company: user.email,
                      address: {
                        street: 'Kalenga street',
                        number: '23',
                        zip: '000000',
                        city: 'Dar es Salaam',
                        country: 'Tanzania'
                      },
                      phone: user.contactNo,
                      email: user.email,
                      website: 'tenderwatch.com',
                    }
                  });
                  myInvoice.toPdf('server/components/services/invoiceUser.pdf', (err1, data1) => {//eslint-disable-line

                    fs.readFile('server/components/services/invoiceUser.pdf', (err, data) => {
                      if (err) throw err;
                      const key = `invoice${user._id}.pdf`;
                      const params = {
                        Bucket: 'tenderwatch/Billing',
                        Key: key,
                        ACL: 'public-read',
                        Body: data
                      };

                      AWS.config.loadFromPath('./server/aws-config.json');
                      const s3 = new AWS.S3();

                      s3.putObject(params, (perr, pres) => {//eslint-disable-line
                        if (perr) {
                          res.send(httpStatus.NOT_FOUND);
                        } else {
                          user.invoiceURL = `${config.s3_url}/Billing/${key}`;
                          user.save()
                            .then(() => {
                              res.status(httpStatus.OK).send({ url: `${config.s3_url}/Billing/${key}` });
                            });
                        }
                      });
                    });
                  });
                } else {
                  res.status(httpStatus.NOT_FOUND);
                }
              });
          })
          .catch();
      }
    })
    .catch();
}

function updateFreeUserService(req, res) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((foundUser) => {
      foundUser.payment = 0;
      foundUser.isPayment = true;
      return foundUser.save()
        .then((user) => {
          Service.find({ userId: user._id })
            .populate('userId')
            .populate('countryId')
            .populate('categoryId')
            .sort('-createdAt')
            .exec()
            .then((services) => {
              let tasks = [];
              if (services.length > 0) {
                tasks = services.map((service) => {
                  const dict = {};
                  const catArr = [];
                  const categories = service.categoryId.map(category => { //eslint-disable-line
                    const catDict = {};
                    catDict.categoryName = category.categoryName;
                    catDict.categoryImage = `data:image/png;base64,${category.imgString}`;
                    catArr.push(catDict);
                  });
                  dict.countryName = service.countryId.countryName;
                  dict.countryImage = `data:image/jpeg;base64,${service.countryId.imageString}`;
                  return {
                    country: dict,
                    category: catArr,
                    unit: service.subscriptionTime === '1' ? 'Free Trial' : service.subscriptionTime === '2' ? 'Monthly' : 'Yearly',//eslint-disable-line
                    quantity: service.categoryId.length,
                    unitPrice: service.subscriptionTime === '1' ? 0 : service.subscriptionTime === '2' ? 15 : 120, //eslint-disable-line
                    expiredDate: `${service.expiredAt.getDate()}-${service.expiredAt.getMonth() + 1}-${service.expiredAt.getFullYear()}`
                  };
                });

                const myInvoice = new Invoice({
                  config: {
                    template: 'server/components/services/invoice.html',
                    tableRowBlock: 'server/components/services/invoiceRow.html'
                  },
                  data: {
                    currencyBalance: {
                      main: 1,
                    },
                    invoice: {
                      number: {
                        id: Date.now()
                      },
                      date: Date(),
                      explanation: 'Thank you for your business!',
                      currency: {
                        main: 'USD',
                      }
                    },
                    tasks
                  },
                  seller: {
                    company: 'TenderWatch Ltd.',
                    address: {
                      street: 'Ground floor, Morani House',
                      city: 'Maktaba Street - Dar es Salaam',
                      country: 'Tanzania',
                      zip: 'P.O. Box 21017'
                    },
                    phone: '+255 22 2127242 / 3',
                    email: ' info@tenderwatch.com',
                    website: 'www.tenderwatch.com',
                  },
                  buyer: {
                    company: user.email,
                    address: {
                      street: 'Kalenga street',
                      number: '23',
                      zip: '000000',
                      city: 'Dar es Salaam',
                      country: 'Tanzania'
                    },
                    phone: user.contactNo,
                    email: user.email,
                    website: 'tenderwatch.com',
                  }
                });
                myInvoice.toPdf('server/components/services/invoiceUser.pdf', (err1, data1) => {//eslint-disable-line

                  fs.readFile('server/components/services/invoiceUser.pdf', (err, data) => {
                    if (err) throw err;
                    const key = `invoice${user._id}.pdf`;
                    const params = {
                      Bucket: 'tenderwatch/Billing',
                      Key: key,
                      ACL: 'public-read',
                      Body: data
                    };

                    AWS.config.loadFromPath('./server/aws-config.json');
                    const s3 = new AWS.S3();

                    s3.putObject(params, (perr, pres) => {//eslint-disable-line
                      if (perr) {
                        res.send(httpStatus.NOT_FOUND);
                      } else {
                        user.invoiceURL = `${config.s3_url}/Billing/${key}`;
                        user.save()
                          .then(() => {
                            res.status(httpStatus.OK).send(foundUser);
                          });
                      }
                    });
                  });
                });
              } else {
                res.status(httpStatus.NOT_FOUND);
              }
            });
        })
        .catch();
    })
    .catch(() => {

    });
}

function invoiceCreateForEmail(services, user) {
  const serviceIdArr = [];
  each(services, (service) => {
    serviceIdArr.push(service._id);
  });

  Service.find({ _id: { $in: serviceIdArr } })
    .populate('countryId')
    .populate('categoryId')
    .exec()
    .then((servicesArr) => {
      let tasks = [];
      if (servicesArr.length > 0) {
        tasks = servicesArr.map((service) => {
          const dict = {};
          const catArr = [];
          const categories = service.categoryId.map(category => { //eslint-disable-line
            const catDict = {};
            catDict.categoryName = category.categoryName;
            catDict.categoryImage = `data:image/png;base64,${category.imgString}`;
            catArr.push(catDict);
          });
          dict.countryName = service.countryId.countryName;
          dict.countryImage = `data:image/jpeg;base64,${service.countryId.imageString}`;
          return {
            country: dict,
            category: catArr,
            unit: service.subscriptionTime === '1' ? 'Free Trial' : service.subscriptionTime === '2' ? 'Monthly' : 'Yearly', //eslint-disable-line
            quantity: service.categoryId.length,
            unitPrice: service.subscriptionTime === '1' ? 0 : service.subscriptionTime === '2' ? 15 : 120,//eslint-disable-line
            expiredDate: `${service.expiredAt.getDate()}-${service.expiredAt.getMonth() + 1}-${service.expiredAt.getFullYear()}`
          };
        });
        const myInvoice = new Invoice({
          config: {
            template: 'server/helpers/Invoices/invoice.html',
            tableRowBlock: 'server/helpers/Invoices/invoiceRow.html'
          },
          data: {
            currencyBalance: {
              main: 1,
            },
            invoice: {
              number: {
                id: Date.now()
              },
              date: Date(),
              explanation: 'Thank you for your business!',
              currency: {
                main: 'USD',
              }
            },
            tasks
          },
          seller: {
            company: 'TenderWatch Ltd.',
            address: {
              street: 'Ground floor, Morani House',
              city: 'Maktaba Street - Dar es Salaam',
              country: 'Tanzania',
              zip: 'P.O. Box 21017'
            },
            phone: '+255 22 2127242 / 3',
            email: ' info@tenderwatch.com',
            website: 'www.tenderwatch.com',
          },
          buyer: {
            company: user.email,
            address: {
              street: 'Kalenga street',
              number: '23',
              zip: '000000',
              city: 'Dar es Salaam',
              country: 'Tanzania'
            },
            phone: user.contactNo,
            email: user.email,
            website: 'tenderwatch.com',
          }
        });
        myInvoice.toHtml('server/helpers/Invoices/my-invoice.html', (err, data) => {
          myInvoice.toPdf('server/helpers/Invoices/my-invoice.pdf', (err1, data1) => {//eslint-disable-line
            const smtpTransport = mailer.createTransport({
              service: 'Gmail',
              auth: {
                user: config.email,
                pass: config.password
              }
            });
            const mail = {
              from: config.email,
              to: user.email,
              subject: 'TenderWatch Payment',
              html: `${data}`,
              attachments: [{
                filename: 'my-invoice.pdf',
                path: 'server/helpers/Invoices/my-invoice.pdf',
              }],
            };

            smtpTransport.sendMail(mail, (error, response) => {
              if (error) {
                console.log('error', `error while sending mail with error: ${error}`);
              } else {
                logger.log('Response', `Email sent with response: ${response}`);
                smtpTransport.close();
              }
            });
            console.log('Saved HTML file');
          });
        });
      }
    })
    .catch();
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  userServices,
  updateUserServices,
  updateFreeUserService
};
