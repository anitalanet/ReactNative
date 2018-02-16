import httpStatus from 'http-status';
import APIError from '../../helpers/APIError';
import Category from './category.model';

/**
 * Load category and append to req.
 */
function load(req, res, next, id) {
  Category.get(id)
    .then((category) => {
      if (!category) {
        req.error = 'No such category exists!';
        return next();
      }
      req.category = category; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get category
 * @returns {Category}
 */
function get(req, res) {
  if (req.error) {
    return res.json(req.error);
  }
  return res.json(req.category);
}

/**
 * Create new category
 * @property {string} req.body.categoryName - The name of category.
 * @returns {Category}
 */
function create(req, res, next) {
  const category = new Category(req.body);

  Category.findOne({ categoryName: req.body.categoryName })
    .exec()
    .then((foundCategory) => {
      if (foundCategory) {
        return Promise.reject(new APIError('Category name must be unique', httpStatus.CONFLICT, true));
      }
      return category.save();
    })
    .then(savedCategory => res.json(savedCategory))
    .catch(e => next(e));
}

/**
 * Update existing category
 * @property {string} req.body.categoryName - The name of category.
 * @returns {Category}
 */
function update(req, res, next) {
  const category = req.category;
  category.categoryName = req.body.categoryName || category.categoryName;
  category.save()
    .then(savedCategory => res.json(savedCategory))
    .catch(e => next(new APIError(e.message, httpStatus.CONFLICT, true)));
}

/**
 * Get category list.
 * @returns {Category[]}
 */
function list(req, res, next) {
  Category.list()
    .then(categories => res.json(categories))
    .catch(e => next(e));
}

/**
 * Delete category.
 * @returns {Category}
 */
function remove(req, res, next) {
  const category = req.category;
  category.remove()
    .then(deletedCategory => res.json(deletedCategory))
    .catch(e => next(e));
}

function getOne(req, res) {
  Category.find({ categoryName: req.body.categoryName })
    .exec()
    .then((c) => {
      if (c) {
        return res.status(httpStatus.OK).send(c);
      }
      return res.status(httpStatus.NOT_FOUND);
    })
    .catch();
}

export default { load, get, create, update, list, remove, getOne };
