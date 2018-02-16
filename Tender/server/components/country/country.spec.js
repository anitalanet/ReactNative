import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import faker from 'faker';
import app from '../../index';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Country APIs', () => {
  let user = {};

  let country = {
    isoCode: faker.address.countryCode(),
    countryName: faker.address.country(),
    countryCode: faker.phone.phoneNumber()
  };

  describe('# POST /api/auth/login', () => {
    it('should authenticate a user', (next) => {
      const checkUser = {
        email: 'tested@gmail.com',
        password: 'lanet@123',
        role: 'contractor',
        deviceId: '71e5e5c9928516cdd0e13e62f74baca1577fc7ff8c92f78d60fe1ab6f4a7392d'
      };
      request(app)
        .post('/api/auth/login')
        .send(checkUser)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.token).to.be.an('string');
          expect(res.body.user.email).to.equal(checkUser.email);
          expect(res.body.user.role).to.equal(checkUser.role);
          expect(res.body.user.deviceId).to.be.an('array');
          user = res.body;
          next();
        })
        .catch(err => next(err));
    });
  });

  describe('# POST /api/country', () => {
    it('should create a new country', (done) => {
      request(app)
        .post('/api/country')
        .send(country)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.countryName).to.equal(country.countryName);
          expect(res.body.countryCode).to.equal(country.countryCode);
          expect(res.body.isoCode).to.equal(country.isoCode);
          country = res.body;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('# GET /api/country/:countryId', () => {
    it('should get country details', (done) => {
      request(app)
        .get(`/api/country/${country._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(country._id);
          expect(res.body.countryName).to.equal(country.countryName);
          expect(res.body.countryCode).to.equal(country.countryCode);
          expect(res.body.isoCode).to.equal(country.isoCode);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('should report error with message - Not found, when country does not exists', (done) => {
      request(app)
        .get('/api/country/56c787ccc67fc16ccc1a5e92')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.error).to.equal('No such country exists!');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('# PUT /api/country/:countryId', () => {
    it('should update country details', (done) => {
      country.countryName = faker.address.country();
      request(app)
        .put(`/api/country/${country._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send(country)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(country._id);
          expect(res.body.countryCode).to.equal(country.countryCode);
          expect(res.body.countryName).to.equal(country.countryName);
          expect(res.body.isoCode).to.equal(country.isoCode);
          country.countryName = res.body.countryName;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('# GET /api/country/', () => {
    it('should get all countries', (done) => {
      request(app)
        .get('/api/country')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('# DELETE /api/country/', () => {
    it('should delete country', (done) => {
      request(app)
        .delete(`/api/country/${country._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(country._id);
          expect(res.body.countryCode).to.equal(country.countryCode);
          expect(res.body.countryName).to.equal(country.countryName);
          expect(res.body.isoCode).to.equal(country.isoCode);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('# Error Handling', () => {
    it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
      request(app)
        .get('/api/country/56z787zzz67fc')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then((res) => {
          expect(res.body.error).to.contain('Cast to ObjectId failed');
          expect(res.body.error).to.contain('56z787zzz67fc');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
