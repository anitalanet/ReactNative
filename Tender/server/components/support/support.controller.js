import httpStatus from 'http-status';
import Winston from 'winston';
import mailer from 'nodemailer';
import APIError from '../../helpers/APIError';

const logger = new (Winston.Logger)({
  transports: [
    new (Winston.transports.File)({ filename: 'logs/sent-email.log' })
  ]
});


function sendSupportMail(req, res, next) {
  const smtpTransport = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: req.body.email,
      pass: req.body.password
    }
  });

  const mail = {
    from: req.body.email,
    cc: ['tenderwatch01@gmail.com'],
    subject: req.body.subject,
    html: req.body.description
  };

  if (res.locals.session.email !== req.body.email) {
    mail.cc.push(res.locals.session.email);
  }

  smtpTransport.sendMail(mail, (error, response) => {
    if (error) {
      logger.log('error', `error while sending mail with error: ${error}`);
      next(new APIError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
    } else {
      logger.log('Response', `Email sent with response: ${response}`);
      res.sendStatus(httpStatus.OK);
      smtpTransport.close();
    }
  });
}

export default { sendSupportMail };
