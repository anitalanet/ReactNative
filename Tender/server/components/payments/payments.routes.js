import express from 'express';
import paymentsCtrl from './payments.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/ephemeral_keys')
// api/payments/ephemeral_keys get all unread notification.
  .post(paymentsCtrl.getEphemeralKeys);

router.route('/charges')
  /** POST api/payments/charges - charge customer using card */
  .post(paymentsCtrl.chargeCustomer);

router.route('/bank/charges')
  /** GET /api/payments/bank/charges - Get Bank account */
  .get(paymentsCtrl.listBankAcc)
  /** POST /api/payments/bank/charges - charge Bank account */
  .post(paymentsCtrl.bankPayment)
  /** DELETE /api/payments/charges - Delete Bank Account */
  .delete(paymentsCtrl.dltBankAccount);

router.route('/direct/charges')
/** POST api/payments/charges - charge customer using card */
  .post(paymentsCtrl.directCardPayment);

export default router;
