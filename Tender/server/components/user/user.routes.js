import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import userCtrl from './user.controller';

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
        case 'image/jpeg' : ext = '.jpg';
          break;
        case 'image/png' : ext = '.png';
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
  updateUser: {
    body: {
      email: Joi.string(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      profilePhoto: Joi.string(),
      country: Joi.string(),
      contactNo: Joi.string()
    }
  },
  changePassword: {
    body: {
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required()
    }
  }
};

router.route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.list)
/** DELETE /api/users - delete device token of logged out device */
  .delete(userCtrl.logout);

router.route('/profile')
/** GET /api/users/profile - Get profile of logged in user */
  .get(userCtrl.getProfile);

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** POST /api/users/userId - Update user */
  .post(upload.single('image'), validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove);

router.route('/changePassword/:userId')
/** POST /api/users/changePassword/:userId - Change Password of logged in user */
  .post(validate(paramValidation.changePassword), userCtrl.changePassword);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

export default router;
