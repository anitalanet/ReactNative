import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { random, each } from 'lodash';
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

describe('## Tender APIs', () => {
  let user = {};

  let tender = {};

  describe('# POST /api/auth/login', () => {
    it('should authenticate a user', (next) => {
      const checkUser = {
        email: 'tested@gmail.com',
        password: 'lanet@123',
        role: 'client',
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

  describe('# POST /api/tender', () => {
    it('should create a new tender', (done) => {
      request(app)
        .get('/api/country')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((countryRes) => {
          const country = countryRes.body;
          request(app)
            .get('/api/category')
            .set({ Authorization: `Bearer ${user.token}` })
            .expect(httpStatus.OK)
            .then((categoryRes) => {
              const category = categoryRes.body;
              tender.tenderName = faker.name.findName();
              tender.country = country[random(0, country.length - 1, false)]._id;
              tender.category = category[random(0, category.length - 1, false)]._id;
              tender.email = faker.internet.email();
              tender.description = faker.lorem.words();
              request(app)
                .post('/api/tender')
                .send(tender)
                .set({ Authorization: `Bearer ${user.token}` })
                .expect(httpStatus.OK)
                .then((res) => {
                  expect(res.body.tender).to.equal(tender.tender);
                  tender = res.body;
                  done();
                })
                .catch(done);
            });
        });
    });
  });

  describe('# GET /api/tender/:tenderId', () => {
    it('should get tender details', (done) => {
      request(app)
        .get(`/api/tender/${tender._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(tender._id);
          expect(res.body.tenderName).to.equal(tender.tenderName);
          expect(res.body.country._id).to.equal(tender.country);
          expect(res.body.category._id).to.equal(tender.category);
          expect(res.body.tenderUploader._id).to.equal(tender.tenderUploader);
          expect(res.body.email).to.equal(tender.email);
          expect(res.body.description).to.equal(tender.description);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when tender does not exists', (done) => {
      request(app)
        .get('/api/tender/56c787ccc67fc16ccc1a5e92')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.error).to.equal('No such tender exists!');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/tender/:tenderId', () => {
    it('should update tender details', (done) => {
      tender.tenderName = faker.name.findName();
      request(app)
        .get('/api/country')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((countryRes) => {
          const country = countryRes.body;
          request(app)
            .get('/api/category')
            .set({ Authorization: `Bearer ${user.token}` })
            .expect(httpStatus.OK)
            .then((categoryRes) => {
              const category = categoryRes.body;
              tender.tenderName = faker.name.findName();
              tender.country = country[random(0, country.length - 1, false)]._id;
              tender.category = category[random(0, category.length - 1, false)]._id;
              tender.email = faker.internet.email();
              tender.description = faker.lorem.words();
              tender.tenderPhoto = tender.tenderPhoto ? tender.tenderPhoto : 'no image';
              request(app)
                .put(`/api/tender/${tender._id}`)
                .set({ Authorization: `Bearer ${user.token}` })
                .send(tender)
                .expect(httpStatus.OK)
                .then((res) => {
                  expect(res.body._id).to.equal(tender._id);
                  expect(res.body.tenderName).to.equal(tender.tenderName);
                  expect(res.body.country).to.equal(tender.country);
                  expect(res.body.category).to.equal(tender.category);
                  expect(res.body.email).to.equal(tender.email);
                  expect(res.body.description).to.equal(tender.description);
                  done();
                })
                .catch((err) => {
                  done(err);
                });
            });
        });
    });
  });

  describe('# GET /api/tender/', () => {
    it('should get all tenders', (done) => {
      request(app)
        .post('/api/tender/getTenders')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/tender/', () => {
    it('should delete tender', (done) => {
      request(app)
        .delete(`/api/tender/${tender._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(tender._id);
          expect(res.body.tenderName).to.equal(tender.tenderName);
          done();
        })
        .catch(done);
    });
  });

  describe('# Error Handling', () => {
    it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
      request(app)
        .get('/api/tender/56z787zzz67fc')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.error).to.contain('Cast to ObjectId failed');
          expect(res.body.error).to.contain('56z787zzz67fc');
          done();
        })
        .catch(done);
    });
  });

  describe('# delete /api/users', () => {
    it('should logout a user', (next) => {
      request(app)
        .delete('/api/users')
        .send({
          deviceId: '71e5e5c9928516cdd0e13e62f74baca1577fc7ff8c92f78d60fe1ab6f4a7392d'
        })
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then(() => next())
        .catch(err => next(err));
    });
  });

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

  describe('# POST /api/tender/getTenders', () => {
    it('should get all tenders', (done) => {
      request(app)
        .post('/api/tender/getTenders')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          tender = res.body.length > 0 ? res.body[random(0, res.body.length - 1, false)] : tender;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/tender/getTenders', () => {
    it('should get all favorite tenders', (done) => {
      request(app)
        .get('/api/tender/getTenders')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          each(res.body, (resTender) => {
            expect(resTender.favorite).to.include(user.user._id);
          });
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/tender/', () => {
    it('should add tender as favorite for contractor', (done) => {
      request(app)
        .put(`/api/tender/favorite/${tender._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.ACCEPTED)
        .then((res) => {
          expect(res.body._id).to.equal(tender._id);
          expect(res.body.favorite).to.include(user.user._id);
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/tender/', () => {
    it('should remove tender from favorites of contractor', (done) => {
      request(app)
        .delete(`/api/tender/favorite/${tender._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.ACCEPTED)
        .then(() => done())
        .catch(done);
    });
  });

  describe('# DELETE /api/tender/', () => {
    it('should disable tender to get in list of tenders', (done) => {
      request(app)
        .delete(`/api/tender/${tender._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .post('/api/tender/getTenders')
            .set({ Authorization: `Bearer ${user.token}` })
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body).to.be.an('array');
              expect(res.body).to.not.include({ _id: tender._id });
              done();
            })
            .catch(done);
        })
        .catch(done);
    });
  });

  describe('# delete /api/users', () => {
    it('should logout a user', (next) => {
      request(app)
        .delete('/api/users')
        .send({
          deviceId: '71e5e5c9928516cdd0e13e62f74baca1577fc7ff8c92f78d60fe1ab6f4a7392d'
        })
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then(() => next())
        .catch(err => next(err));
    });
  });
});
