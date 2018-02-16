import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import mailer from 'nodemailer';
import Google from 'google-auth-library';
import request from 'request';
import Winston from 'winston';
import { each } from 'lodash';
import APIError from '../../helpers/APIError';
import User from '../user/user.model';
import Country from '../country/country.model';
import Category from '../category/category.model';
import Service from '../services/services.model';
import config from '../../config/env';
import { createCustomer } from '../../helpers/stripeHelper';

const logger = new (Winston.Logger)({
  transports: [
    new (Winston.transports.File)({ filename: 'logs/sent-email.log' })
  ]
});

const auth = new Google();

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
/**
 *  Returns jwt token and user details if valid email and password are provided
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.password - The password of user.
 * @returns {token, User}
 */
function login(req, res, next) {
  let userId = null;

  function removeDeviceIds() {
    User.find({ _id: { $ne: userId }, role: { $ne: req.body.role }, deviceId: req.body.deviceId })
      .count()
      .exec()
      .then((count) => {
        if (count) {
          User.update({
            _id: { $ne: userId },
            deviceId: req.body.deviceId,
            role: { $ne: req.body.role }
          }, {
            $pull: { deviceId: req.body.deviceId }
          }, {
            upsert: true,
            multi: true
          }).exec();
        }
      });
  }

  if (req.url === '/glogin') {
    var userAgent = req.headers['user-agent'];
    var authClient;
    var googleAuthClient;
    if(userAgent.includes('iOS')){
      authClient = new auth.OAuth2(config.googleAuthClient, '', '');
      googleAuthClient = config.googleAuthClient
    }else{
      authClient = new auth.OAuth2(config.googleAuthClientAndroid, '', '');
      googleAuthClient = config.googleAuthClientAndroid
    }

    authClient.verifyIdToken(req.body.token, config.googleAuthClient, (err, checkLogin) => {
      const email = checkLogin.getPayload().email;
      User.getByEmailRole(email, req.body.role)
        .then((foundUser) => {
          console.log(foundUser)
          if (foundUser) {
            if (foundUser.role !== req.body.role) {
              return next(new APIError('User role do not match', httpStatus.UNAUTHORIZED));
            }
            if (!foundUser.deviceId.includes(req.body.deviceId)) {
              foundUser.deviceId.push(req.body.deviceId);
              foundUser.save();
            }
            const token = jwt.sign(foundUser.safeModel(), config.jwtSecret, {
              expiresIn: config.jwtExpiresIn
            });
            const user = foundUser.safeModel();
            user.profilePhoto = user.profilePhoto ? `${config.s3_url}/profileimages/${user.profilePhoto}` : 'no image';
            userId = foundUser._id;
            removeDeviceIds();
            return res.json({
              token,
              user
            });
          }
          return res.status(404).send({ errorType: 'NoUserAvailable', errorMessage: 'User is not registered in app' });
        })
        .catch((err1) => {
        console.log(err1.toString())
          const errorGmail = new APIError(err1.message, httpStatus.BAD_REQUEST);
          return next(errorGmail);
        });
    });
  } else if (req.url === '/facelogin') {
    const facebookReq = {
      url: `https://graph.facebook.com/me?fields=id,name,email&access_token=${req.body.token}`,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(facebookReq, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const info = JSON.parse(body);
        User.getByEmailRole(info.email, req.body.role)
          .then((foundUser) => {
            if (foundUser) {
              if (foundUser.role !== req.body.role) {
                const err = new APIError('User role do not match', httpStatus.UNAUTHORIZED);
                return next(err);
              }
              if (!foundUser.deviceId.includes(req.body.deviceId)) {
                foundUser.deviceId.push(req.body.deviceId);
                foundUser.save();
              }
              const token = jwt.sign(foundUser.safeModel(), config.jwtSecret, {
                expiresIn: config.jwtExpiresIn
              });
              const user = foundUser.safeModel();
              user.profilePhoto = user.profilePhoto ? `${config.s3_url}/profileimages/${user.profilePhoto}` : 'no image';
              userId = foundUser._id;
              removeDeviceIds();
              return res.json({
                token,
                user
              });
            }
            return res.status(404).send({
              errorType: 'NoUserAvailable',
              errorMessage: 'User is not registered in app'
            });
          })
          .catch((err) => {
            const errorFacebook = new APIError(err.message, httpStatus.BAD_REQUEST);
            return next(errorFacebook);
          });
      }
    });
  } else {
    User.getByEmailRole(req.body.email, req.body.role)
      .then((foundUser) => {
        if (foundUser) {
          if (!foundUser.validPassword(req.body.password)) {
            const err = new APIError('User email and password combination do not match', httpStatus.UNAUTHORIZED);
            return next(err);
          } else if (foundUser.role !== req.body.role) {
            const err = new APIError('User role do not match', httpStatus.UNAUTHORIZED);
            return next(err);
          }
          if (!foundUser.deviceId.includes(req.body.deviceId)) {
            foundUser.deviceId.push(req.body.deviceId);
            foundUser.save();
          }
          const token = jwt.sign(foundUser.safeModel(), config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
          });
          const user = foundUser.safeModel();
          user.profilePhoto = user.profilePhoto ? `${config.s3_url}/profileimages/${user.profilePhoto}` : 'no image';
          userId = foundUser._id;
          removeDeviceIds();
          return res.status(200).json({
            token,
            user
          });
        }
        return res.status(404).send({ errorType: 'NoUserAvailable', errorMessage: 'User is not registered in app' });
      })
      .catch((err) => {
        const error = new APIError(err.message, httpStatus.NOT_FOUND);
        return next(error);
      });
  }
}

/**
 * Register a new user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.password - The password of user.
 * @property {string} req.body.firstName - The firstName of user.
 * @property {string} req.body.lastName - The lastName of user.
 * @property {string} req.body.profilePhoto - The profilePhoto of user.
 * @property {string} req.body.country - The country of user.
 * @property {string} req.body.contactNo - The contactNo of user.
 * @property {string} req.body.occupation - The occupation of user.
 * @property {string} req.body.aboutMe - The aboutMe of user.
 * @returns {User}
 */
function register(req, res, next) {
  let user = new User(req.body);
  const userSelection = req.body;

  if (req.file) {
    user.profilePhoto = `image_${req.file.key.split('image_')[1]}`;
  }

  User.findOne({ email: req.body.email })
    .exec()
    .then((foundUser) => {
      if (foundUser) {
        if (foundUser.role === req.body.role) {
          return Promise.reject(new APIError('This email is already used', httpStatus.CONFLICT));
        }
      }
      user.password = user.generatePassword(req.body.password);
      const smtpTransport = mailer.createTransport({
        service: 'Gmail',
        auth: {
          user: config.email,
          pass: config.password
        }
      });

      const mail = {
        from: config.email,
        to: req.body.email,
        subject: 'TenderWatch Registration',
        html: '<html>\n' +
        '        <body>\n' +
        '            <div style="text-align: center;justify-content: space-around;">\n' +
        '                <h3>TenderWatch</h3>\n' +
        '                <p>You are successfully registered on Tender Watch.</p>' +
        '                <p>Welcome to <b>TenderWatch</b>, the App that connects Contractors to Clients within their area of work.</p>' +
        '                <p>As a <b>Client</b> you will be able to easily upload any contract / Tender, that will go out to all relevant Contractors in your area. And prospective Contractors will contact you directly and apply for your Contract / tender. All Tenders/ Contracts can be uploaded free of cost, always.</p>' +
        '                <p>As a <b>Contractor</b> once you register on this App and choose the category of your scope of work, all Tenders/ contracts relevant to your scope of work will come to you directly and give you the opportunity to apply for these contracts within your working area. The App will filter and send just relevant Tenders/ contracts to you.</p>' +
        '                <p><b>Tender / Contract</b> can be any work or service. It could be anything from Supply of different things, to Services required such as Plumbing, Gardening, Repairs & Maintenance etc.</p>' +
        '                <p><b>TenderWatch</b> is also a unique way of getting Corporate and Government contracts so you don\'t miss out on any potential Tender / contract within your scope of work.</p>' +
        '                <p>We are sure this App will help all Contractors and Clients make contact more effectively and conveniently.</p>' +
        '            </div>\n' +
        '        </body>\n' +
        '    </html>'
      };

      smtpTransport.sendMail(mail, (error, response) => {
        if (error) {
          console.log('error', `error while sending mail with error: ${error}`);
        } else {
          logger.log('Response', `Email sent with response: ${response}`);
          smtpTransport.close();
        }
      });
      return user.save();
    })
    .then((savedUser) => {
      const token = jwt.sign(savedUser.safeModel(), config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });
      const services = [];

      function create(selection) {
        return new Promise(
          (resolve) => {
            if (selection.selections) {
              let payment = 0;
              const selectionObj = JSON.parse(selection.selections.replace('\n', ''));
              each(selectionObj, (value, key) => {
                const CurrentDate = new Date();
                services.push({
                  userId: savedUser._id,
                  countryId: key,
                  categoryId: value,
                  subscriptionTime: savedUser.subscribe,
                  expiredAt: savedUser.subscribe === '3' ? new Date(new Date(new Date(new Date(CurrentDate.setYear(CurrentDate.getYear() + 1901)).setHours(0)).setMinutes(0)).setSeconds(0)) : new Date(new Date(new Date(new Date(CurrentDate.setMonth(CurrentDate.getMonth() + 1)).setHours(0)).setMinutes(0)).setSeconds(0))
                });
                payment += payment + (value.length * (savedUser.subscribe === '3' ? 120 : 15));
              });
              savedUser.payment = payment;
              savedUser.save();
              Service.create(services, (err) => {
                if (err) {
                  console.log('error while creating user\'s service list with error: ', err);
                }
                resolve();
              });
            } else {
              resolve();
            }
          }
        );
      }

      create(userSelection).then(() => {
        if (savedUser.role === 'contractor') {
          createCustomer({
            email: savedUser.email,
            name: savedUser.email
          })
            .then((customer) => {
              savedUser.stripeDetails = customer;
              savedUser.save();
            });
        }
        const userObj = savedUser.safeModel();
        if (userObj.profilePhoto !== null) {
          userObj.profilePhoto = userObj.profilePhoto ? `${config.s3_url}/profileimages/${userObj.profilePhoto}` : 'no image';
        }
        user = userObj;
        return res.json({
          token,
          user
        });
      });
    })
    .catch(e => next(e));
}

function forgot(req, res) {
  User.findOne({ email: req.body.email, role: req.body.role })
    .exec()
    .then((foundUser) => {
      if (foundUser) {
        const smtpTransport = mailer.createTransport({
          service: 'Gmail',
          auth: {
            user: config.email,
            pass: config.password
          }
        });
        const pwd = foundUser.getPassword();
        const mail = {
          from: config.email,
          to: req.body.email,
          subject: 'TenderWatch - Forgot Password',
          html:
          `<html> 
                 <body>
                     <div style="text-align: center;justify-content: space-around;">
                          <h3>TenderWatch</h3>
                          <p>Your password for Tender Watch is:<b>${pwd}</b>, kindly change your password for security.</p>
                      </div>
                  </body>
           </html>`
        };
        smtpTransport.sendMail(mail, (error, response) => {
          if (error) {
            console.log(error);
          } else {
            logger.log('Response', `Email sent with response: ${response}`);
            console.log('Forget password email sent...');
            smtpTransport.close();
          }
        });
        return res.status(httpStatus.OK).json({
          user: foundUser.safeModel()
        });
      }
      return res.status(httpStatus.NOT_FOUND).json({ message: 'This Email is not Register in our application.' });
    });
}

function getCountries(req, res) {
  Country.find({}, (err, country) => {
    res.json(country);
  });
}

function getCategories(req, res) {
  Category.find({}, (err, category) => {
    res.json(category);
  });
}

function checkEmail(req, res) {
  User.findOne({ email: req.body.email, role: req.body.role })
    .exec()
    .then((foundUser) => {
      if (foundUser) {
        return res.status(httpStatus.FOUND).json({ message: 'This Email is Register in our application' });
      }
      return res.status(httpStatus.NOT_FOUND).json({ message: 'This Email is not Register in our application.' });
    });
}

export default { login, register, forgot, getCountries, getCategories, checkEmail };
