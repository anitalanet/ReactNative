/* eslint-disable */
import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, {expect} from 'chai';
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

describe('## Category APIs', () => {
  let user = {};

  let category = {
    categoryName: faker.name.findName()
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

  describe('# POST /api/category', () => {
    it('should create a new category', (done) => {
      request(app)
        .post('/api/category')
        .send(category)
        .set({Authorization: `Bearer ${user.token}`})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.categoryName).to.equal(category.categoryName);
          category = res.body;
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });

  describe('# GET /api/category/:categoryId', () => {
    it('should get category details', (done) => {
      request(app)
        .get(`/api/category/${category._id}`)
        .set({Authorization: `Bearer ${user.token}`})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(category._id);
          expect(res.body.categoryName).to.equal(category.categoryName);
          done();
        })
        .catch(err => {
          done(err);
        })
    });

    it('should report error with message - Not found, when category does not exists', (done) => {
      request(app)
        .get('/api/category/56c787ccc67fc16ccc1a5e92')
        .set({Authorization: `Bearer ${user.token}`})
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.error).to.equal('No such category exists!');
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });

  describe('# PUT /api/category/:categoryId', () => {
    it('should update category details', (done) => {
      category.categoryName = faker.name.findName();
      request(app)
        .put(`/api/category/${category._id}`)
        .set({Authorization: `Bearer ${user.token}`})
        .send(category)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(category._id);
          expect(res.body.categoryName).to.equal(category.categoryName);
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });

  describe('# GET /api/category/', () => {
    it('should get all categories', (done) => {
      request(app)
        .get('/api/category')
        .set({Authorization: `Bearer ${user.token}`})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });

  describe('# DELETE /api/category/', () => {
    it('should delete category', (done) => {
      request(app)
        .delete(`/api/category/${category._id}`)
        .set({Authorization: `Bearer ${user.token}`})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body._id).to.equal(category._id);
          expect(res.body.categoryName).to.equal(category.categoryName);
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });

  describe('# Error Handling', () => {
    it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
      request(app)
        .get('/api/category/56z787zzz67fc')
        .set({Authorization: `Bearer ${user.token}`})
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then((res) => {
          expect(res.body.error).to.includes('Cast to ObjectId failed');
          expect(res.body.error).to.includes('56z787zzz67fc');
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });
});
