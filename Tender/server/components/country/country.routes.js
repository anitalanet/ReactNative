import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import countryCtrl from './country.controller';

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  createCountry: {
    body: {
      countryName: Joi.string().required(),
      countryCode: Joi.string(),
      isoCode: Joi.string(),
    }
  },
  updateCountry: {
    body: {
      countryName: Joi.string().required(),
      countryCode: Joi.string(),
      isoCode: Joi.string(),
    },
  }
};

router.route('/')
  /** GET /api/country - Get list of countries */
  .get(countryCtrl.list)

  /** POST /api/country - Create new country */
  .post(validate(paramValidation.createCountry), countryCtrl.create);

router.route('/:countryId')
  /** GET /api/country/:countryId - Get country */
  .get(countryCtrl.get)

  /** PUT /api/country/:countryId - Update country */
  .put(validate(paramValidation.updateCountry), countryCtrl.update)

  /** DELETE /api/country/:countryId - Delete country */
  .delete(countryCtrl.remove);

router.route('/name')
/** GET /api/country/name - Get single country */
  .post(countryCtrl.getOne);

router.route('/newCountries')
  .post(countryCtrl.addnewcountries);

/** Load country when API with countryId route parameter is hit */
router.param('countryId', countryCtrl.load);

export default router;
