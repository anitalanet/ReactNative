import express from 'express';
import validate from 'express-validation';
import Joi from 'joi';
import categoryCtrl from './category.controller';

const router = express.Router(); // eslint-disable-line new-cap
const paramValidation = {
  createCategory: {
    body: {
      categoryName: Joi.string().required()
    }
  },
  updateCategory: {
    body: {
      categoryName: Joi.string().required()
    },
  }
};

router.route('/')
  /** GET /api/category - Get list of categories */
  .get(categoryCtrl.list)

  /** POST /api/category - Create new category */
  .post(validate(paramValidation.createCategory), categoryCtrl.create);

router.route('/:categoryId')
  /** GET /api/category/:categoryId - Get category */
  .get(categoryCtrl.get)

  /** PUT /api/category/:categoryId - Update category */
  .put(validate(paramValidation.updateCategory), categoryCtrl.update)

  /** DELETE /api/category/:categoryId - Delete category */
  .delete(categoryCtrl.remove);

router.route('/name')
/** GET /api/country/name - Get single country */
    .post(categoryCtrl.getOne);

/** Load country when API with categoryId route parameter is hit */
router.param('categoryId', categoryCtrl.load);

export default router;
