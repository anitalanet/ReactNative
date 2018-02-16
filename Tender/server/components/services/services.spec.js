import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import { each, random } from 'lodash';
import chai, { expect } from 'chai';
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

  let services = {};

  describe('# POST /api/auth/login', () => {
    it('should authenticate a user', (next) => {
      const checkUser = {
        email: 'testm@gmail.com',
        password: '1234',
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

  describe('# GET /api/service/userServices', () => {
    it('should fetch the mapped object of of country and categories', (done) => {
      request(app)
        .get('/api/service/userServices')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          each(res.body, (value, key) => {
            expect(value).to.be.an('array');
            expect(key).to.be.an('string');
          });
          services = res.body;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('# PUT /api/service/userServices', () => {
    it('should fetch the mapped object of of country and categories', (done) => {
      each(services, (value, key) => {
        const i = random(0, value.length - 1, false);
        value.splice(i, 1);
        services[key] = value;
      });
      request(app)
        .put('/api/service/userServices')
        .send({ selections: services })
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          each(res.body, (value, key) => {
            expect(value).to.be.an('array');
            expect(key).to.be.an('string');
          });
          services = res.body;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
