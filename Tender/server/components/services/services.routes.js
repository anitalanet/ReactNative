import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import serviceCtrl from './services.controller';

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  createService: {
    body: {
      userId: Joi.string().required(),
      selections: Joi.any()
    }
  },
  updateService: {
    body: {
      userId: Joi.string().required(),
      countryId: Joi.string(),
      categoryId: Joi.array(),
    },
  }
};

router.route('/')
/** GET /api/service - Get list of services */
  .get(serviceCtrl.list)

  /** POST /api/service - Create new service */
  .post(validate(paramValidation.createService), serviceCtrl.create);

router.route('/userServices')
/** GET /api/service/userServices - Get free user services */
  .get(serviceCtrl.updateFreeUserService)

  /** POST /api/service/userServices - Get services */
  .post(serviceCtrl.userServices)

  /** PUT /api/service/userServices - Update service */
  .put(serviceCtrl.updateUserServices);

router.route('/:serviceId')
/** GET /api/service/:serviceId - Get service */
  .get(serviceCtrl.get)

  /** PUT /api/service/:serviceId - Update service */
  .put(validate(paramValidation.updateService), serviceCtrl.update)

  /** DELETE /api/service/:serviceId - Delete service */
  .delete(serviceCtrl.remove);

/** Load services when API with serviceId route parameter is hit */
router.param('serviceId', serviceCtrl.load);

export default router;
