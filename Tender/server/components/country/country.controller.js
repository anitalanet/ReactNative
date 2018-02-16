import httpStatus from 'http-status';
import { each } from 'lodash';
import APIError from '../../helpers/APIError';
import Country from './country.model';

/**
 * Load country and append to req.
 */
function load(req, res, next, id) {
  Country.get(id)
    .then((country) => {
      if (!country) {
        req.error = 'No such country exists!';
        return next();
      }
      req.country = country; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get country
 * @returns {Country}
 */
function get(req, res) {
  return res.json(req.country);
}

/**
 * Create new country
 * @property {string} req.body.countryName - The name of country.
 * @returns {Country}
 */
function create(req, res, next) {
  const country = new Country(req.body);

  Country.findOne({ countryName: req.body.countryName })
    .exec()
    .then((foundCountry) => {
      if (foundCountry) {
        return Promise.reject(new APIError('Country name must be unique', httpStatus.CONFLICT, true));
      }
      return country.save();
    })
    .then(savedCountry => res.json(savedCountry))
    .catch(e => next(e));
}

/**
 * Update existing country
 * @property {string} req.body.countryName - The name of country.
 * @returns {Country}
 */
function update(req, res, next) {
  const country = req.country;
  country.countryName = req.body.countryName || country.countryName;
  country.countryCode = req.body.countryCode || country.countryCode;
  country.isoCode = req.body.isoCode || country.isoCode;
  country.save()
    .then(savedCountry => res.json(savedCountry))
    .catch(e => next(new APIError(e.message, httpStatus.CONFLICT, true)));
}

/**
 * Get country list.
 * @returns {Country[]}
 */
function list(req, res, next) {
  Country.list()
    .then(countries => res.json(countries))
    .catch(e => next(e));
}

/**
 * Delete country.
 * @returns {Country}
 */
function remove(req, res, next) {
  const country = req.country;
  country.remove()
    .then(deletedCountry => res.json(deletedCountry))
    .catch(e => next(e));
}

function addnewcountries(req, res) {
  const newCountries = [];
  each(req.body, (country) => {
    newCountries.push({
      countryName: country.name.common,
      countryCode: country.callingCode[0],
      isoCode: country.cca2.toUpperCase(),
      isoCurrencyCode: country.currency[0].toLowerCase()
    });
  });

  return Country.create(newCountries, (err, countries) => {
    if (err) return res.status(500).send(err);
    return res.send(countries);
  });
}

function getOne(req, res) {
  Country.find({ countryName: req.body.countryName })
    .exec()
    .then((c) => {
      if (c) {
        return res.status(httpStatus.OK).send(c);
      }
      return res.status(httpStatus.NOT_FOUND);
    })
    .catch();
}


export default { load, get, create, update, list, remove, addnewcountries, getOne };
