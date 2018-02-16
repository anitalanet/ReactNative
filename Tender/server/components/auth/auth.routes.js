import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import authCtrl from './auth.controller';

aws.config.loadFromPath('./server/aws-config.json');
const s3 = new aws.S3();

let imageName;
const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'tenderwatch',
    acl: 'public-read',
    location: 'profileimages/',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      let ext = '';
      switch (file.mimetype) {
        case 'image/jpeg' :
          ext = '.jpg';
          break;
        case 'image/png' :
          ext = '.png';
          break;
        default :
          ext = '.jpg';
          break;
      }
      imageName = `image_${Date.now().toString()}${ext}`;
      cb(null, `profileimages/${imageName}`);
    }
  })
});

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
      deviceId: Joi.string().required()
    }
  },
  googleLogin: {
    body: {
      token: Joi.string().required(),
      role: Joi.string().required(),
      deviceId: Joi.string().required()
    }
  },
  registerUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      profilePhoto: Joi.string(),
      country: Joi.string(),
      contactNo: Joi.string(),
      selections: Joi.any(),
      deviceId: Joi.string().required()
    }
  },
};

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), authCtrl.login);

router.route('/glogin')
  .post(validate(paramValidation.googleLogin), authCtrl.login);

router.route('/facelogin')
  .post(validate(paramValidation.googleLogin), authCtrl.login);

/** POST /api/auth/register - Register a new user */
router.route('/register')
  .post(upload.single('image'), validate(paramValidation.registerUser), authCtrl.register);

router.route('/forgot')
/** POST /api/auth/forgot - Send password on email */
  .post(authCtrl.forgot);

router.route('/country')
/** GET /api/auth/country - Get countries */
  .get(authCtrl.getCountries);

router.route('/category')
/** GET /api/auth/category - Get categories */
  .get(authCtrl.getCategories);


/** POST /api/auth/checkEmail - check the availability of Email id for signup */
router.route('/checkEmail')
  .post(authCtrl.checkEmail);

export default router;
