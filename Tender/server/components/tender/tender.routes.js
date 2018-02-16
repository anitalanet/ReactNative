import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';

import authHelper from '../auth/auth.helper';
import tenderCtrl from './tender.controller';

aws.config.loadFromPath('./server/aws-config.json');
const s3 = new aws.S3();

let imageName;
const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'tenderwatch',
    acl: 'public-read',
    location: 'tenderimages/',
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
      cb(null, `tenderimages/${imageName}`);
    }
  })
});

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  createTender: {
    body: {
      country: Joi.string(),
      category: Joi.string(),
      tenderName: Joi.string().required(),
      description: Joi.string(),
      tenderPhoto: Joi.string(),
      isFollowTender: Joi.boolean()
    }
  },
  updateTender: {
    body: {
      country: Joi.string(),
      category: Joi.string(),
      tenderName: Joi.string().required(),
      description: Joi.string(),
      tenderPhoto: Joi.string(),
      isFollowTender: Joi.boolean()
    },
  }
};

router.route('/')
/** GET /api/tender - Get list of tenders */
  .get(tenderCtrl.list)

  /** POST /api/tender - Create new tender */
  .post(upload.single('image'), validate(paramValidation.createTender), tenderCtrl.create);

router.route('/getTenders')
/** POST /api/tender/getTenders - Get tender */
  .post(tenderCtrl.getTenders)
  .get(tenderCtrl.getFavorite);

router.route('/favorite/:favTenderId')
  .put(tenderCtrl.addFavorite)
  .delete(tenderCtrl.deleteFavorite);

router.route('/:tenderId')
/** GET /api/tender/:tenderId - Get tender */
  .get(tenderCtrl.get)

  /** PUT /api/tender/:tenderId - Update tender */
  .put(upload.single('image'), validate(paramValidation.updateTender), authHelper.hasRole('client'), tenderCtrl.update)

  /** DELETE /api/tender/:tenderId - Delete tender */
  .delete(tenderCtrl.remove);

router.route('/interested/:tenderId')
  /** PUT /api/tender/interested/:tenderId - add contractor intereste in tender */
  .put(authHelper.hasRole('contractor'), tenderCtrl.addInterested);

/** Load tender when API with tenderId route parameter is hit */
router.param('tenderId', tenderCtrl.load);

export default router;
