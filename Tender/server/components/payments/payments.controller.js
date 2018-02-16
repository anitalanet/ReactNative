import Winston from 'winston';
import User from '../user/user.model';
import httpStatus from '../../../node_modules/http-status';

const logger = new (Winston.Logger)({
  transports: [
    new (Winston.transports.File)({ filename: 'logs/payment.log' })
  ]
});
const stripe = require('stripe')('sk_test_B40bvBCus9RftZLEveSP0eSj');

function getEphemeralKeys(req, res) {
  if (!req.body.api_version) {
    res.status(httpStatus.BAD_REQUEST).end();
    return;
  }
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((customer) => {
      stripe.ephemeralKeys.create(
        { customer: customer.stripeDetails.id },
        { stripe_version: req.body.api_version }
      ).then((key) => {
        logger.log('create', `Create a new Customer ${customer.email} in Stripe`);
        res.status(httpStatus.OK).json(key);
      }).catch((err) => {
        logger.log('failed', `Can't create a new Customer ${customer.email} in Stripe`);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
      });
    });
}

function chargeCustomer(req, res) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((customer) => {
      stripe.charges.create({
        amount: req.body.amount,
        currency: 'usd',
        source: req.body.source, // obtained with Stripe.js
        description: `Charge for ${customer.email}`
      })
        .then(() => {
          logger.log('charge', `Succesfully Charge from ${customer.email} in Stripe`);
          res.status(httpStatus.OK).send({ message: 'success' });
        })
        .catch((err) => {
          logger.log('failed', `Charge can't perform using ${customer.email} account in Stripe`);
          res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
        });
    });
}

function bankPayment(req, res) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((user) => {
      const CustomerStripeid = user.stripeDetails.id;
      const data = { amounts: [32, 45] };
      if (req.body.source) {
        stripe.charges.create({
          amount: req.body.amount,
          currency: 'usd',
          customer: CustomerStripeid,
          source: req.body.source, // obtained with Stripe.js
          description: `Charge for ${user.email}`
        })
              .then(() => {
                logger.log('charge', `Succesfully Charge from ${user.email} in Stripe`);
                res.status(httpStatus.OK).send({ message: 'success' });
              })
              .catch((err) => {
                logger.log('failed', `Charge can't perform using ${user.email} account in Stripe`);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
              });
      } else {
        stripe.customers.createSource(CustomerStripeid,
          { source: req.body.token })
          .then((bankAcc) => {
            const bankAccId = bankAcc.id;
            stripe.customers.verifySource(
              CustomerStripeid,
              bankAccId,
              data)
              .then(() => {
                res.status(httpStatus.OK).send({ message: 'Source Create Succesfully' });
              })
              .catch(() => {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Source Create Succesfully' });
              });
          })
          .catch(() => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'can not create bank account' });
          });
      }
    })
    .catch();
}

function listBankAcc(req, res) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((user) => {
      stripe.customers.listSources(
        user.stripeDetails.id,
        { limit: 100, object: 'bank_account' })
        .then((resp) => {
          res.status(httpStatus.OK).send(resp);
        })
        .catch((e) => {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
    })
    .catch(() => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'can not find user' });
    });
}

function dltBankAccount(req, res) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((user) => {
      stripe.customers.deleteSource(
        user.stripeDetails.id,
        req.body.bankId)
        .then(() => {
          res.status(httpStatus.OK).send({ message: 'Successfully Remove Bank Account from Customer Record' });
        })
        .catch((e) => {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
    })
    .catch(() => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'can not find user' });
    });
}

function directCardPayment(req, res) {
  User.findOne({ email: res.locals.session.email, role: res.locals.session.role })
    .then((user) => {
      const id = user.stripeDetails.id;
      stripe.charges.create({
        amount: req.body.amount,
        customer: id,
        source: req.body.source,
        currency: 'usd'
      })
        .then((resp) => {
          res.status(httpStatus.OK).send(resp);
        })
        .catch((e) => {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
        });
    });
}

export default {
  getEphemeralKeys,
  chargeCustomer,
  bankPayment,
  listBankAcc,
  dltBankAccount,
  directCardPayment
};
