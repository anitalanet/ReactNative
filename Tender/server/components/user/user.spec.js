// import mongoose from 'mongoose';
// import request from 'supertest-as-promised';
// import httpStatus from 'http-status';
// import chai, { expect } from 'chai';
// import faker from 'faker';
// import app from '../../index';
//
// chai.config.includeStack = true;
//
// /**
//  * root level hooks
//  */
// after((done) => {
//   // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
//   mongoose.models = {};
//   mongoose.modelSchemas = {};
//   mongoose.connection.close();
//   done();
// });
//
// describe('## User APIs', () => {
//   let user = {};
//
//   describe('# POST /api/auth/login', () => {
//     it('should authenticate a user', (next) => {
//       const checkUser = {
//         email: 'tested@gmail.com',
//         password: 'lanet@123',
//         role: 'client',
//         deviceId: '71e5e5c9928516cdd0e13e62f74baca1577fc7ff8c92f78d60fe1ab6f4a7392d'
//       };
//       request(app)
//         .post('/api/auth/login')
//         .send(checkUser)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.token).to.be.an('string');
//           expect(res.body.user.email).to.equal(checkUser.email);
//           expect(res.body.user.role).to.equal(checkUser.role);
//           expect(res.body.user.deviceId).to.be.an('array');
//           user = res.body;
//           next();
//         })
//         .catch(err => next(err));
//     });
//   });
//
//   // describe('# POST /api/auth/register', () => {
//   //   it('should create a new user', (done) => {
//   //     request(app)
//   //       .post('/api/auth/register')
//   //       .send(user)
//   //       .expect(httpStatus.OK)
//   //       .then((res) => {
//   //         expect(res.body.token).to.not.equal('');
//   //         expect(res.body.token).to.not.equal(undefined);
//   //         expect(res.body.user.email).to.equal(user.email);
//   //         expect(res.body.user.firstName).to.equal(user.firstName);
//   //         expect(res.body.user.lastName).to.equal(user.lastName);
//   //         expect(res.body.user.profilePhoto).to.equal(user.profilePhoto);
//   //         expect(res.body.user.country).to.equal(user.country);
//   //         expect(res.body.user.contactNo).to.equal(user.contactNo);
//   //         expect(res.body.user.occupation).to.equal(user.occupation);
//   //         expect(res.body.user.aboutMe).to.equal(user.aboutMe);
//   //         expect(res.body.user.password).to.equal(undefined); // Password should be removed.
//   //         user = res.body.user;
//   //         user.token = res.body.token;
//   //         done();
//   //       })
//   //       .catch(done);
//   //   });
//   // });
//
//   describe('# POST /api/auth/forgot', () => {
//     it('should send password on email', (done) => {
//       request(app)
//         .post('/api/users/forgot')
//         .send(user)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body).to.be.an('array');
//           done();
//         })
//         .catch(done);
//     });
//   });
//
//   describe('# GET /api/users/:userId', () => {
//     it('should get user details', (done) => {
//       request(app)
//         .get(`/api/users/${user._id}`)
//         .set({ Authorization: `Bearer ${user.token}` })
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.user.email).to.equal(user.email);
//           expect(res.body.user.firstName).to.equal(user.firstName);
//           expect(res.body.user.lastName).to.equal(user.lastName);
//           expect(res.body.user.profilePhoto).to.equal(user.profilePhoto);
//           expect(res.body.user.country).to.equal(user.country);
//           expect(res.body.user.contactNo).to.equal(user.contactNo);
//           expect(res.body.user.occupation).to.equal(user.occupation);
//           expect(res.body.user.aboutMe).to.equal(user.aboutMe);
//           expect(res.body.user.password).to.equal(undefined); // Password should be removed.
//           done();
//         })
//         .catch(done);
//     });
//
//     it('should report error with message - Not found, when user does not exists', (done) => {
//       request(app)
//         .get('/api/users/56c787ccc67fc16ccc1a5e92')
//         .set({ Authorization: `Bearer ${user.token}` })
//         .expect(httpStatus.NOT_FOUND)
//         .then((res) => {
//           expect(res.body.error).to.equal('No such user exists!');
//           done();
//         })
//         .catch(done);
//     });
//   });
//
//   describe('# POST /api/users/:userId', () => {
//     it('should update user details', (done) => {
//       user.firstName = faker.name.firstName();
//       request(app)
//         .post(`/api/users/${user._id}`)
//         .set({ Authorization: `Bearer ${user.token}` })
//         .send(user)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.user.email).to.equal(user.email);
//           expect(res.body.user.firstName).to.equal(user.firstName);
//           expect(res.body.user.lastName).to.equal(user.lastName);
//           expect(res.body.user.profilePhoto).to.equal(user.profilePhoto);
//           expect(res.body.user.country).to.equal(user.country);
//           expect(res.body.user.contactNo).to.equal(user.contactNo);
//           expect(res.body.user.occupation).to.equal(user.occupation);
//           expect(res.body.user.aboutMe).to.equal(user.aboutMe);
//           expect(res.body.user.password).to.equal(undefined); // Password should be removed.
//           done();
//         })
//         .catch(done);
//     });
//   });
//
//   describe('# GET /api/users/', () => {
//     it('should get all users', (done) => {
//       request(app)
//         .get('/api/users')
//         .set({ Authorization: `Bearer ${user.token}` })
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body).to.be.an('array');
//           done();
//         })
//         .catch(done);
//     });
//   });
//
//   describe('# DELETE /api/users/', () => {
//     it('should delete user', (done) => {
//       request(app)
//         .delete(`/api/users/${user._id}`)
//         .set({ Authorization: `Bearer ${user.token}` })
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.user.email).to.equal(user.email);
//           expect(res.body.user.firstName).to.equal(user.firstName);
//           expect(res.body.user.lastName).to.equal(user.lastName);
//           expect(res.body.user.profilePhoto).to.equal(user.profilePhoto);
//           expect(res.body.user.country).to.equal(user.country);
//           expect(res.body.user.contactNo).to.equal(user.contactNo);
//           expect(res.body.user.occupation).to.equal(user.occupation);
//           expect(res.body.user.aboutMe).to.equal(user.aboutMe);
//           expect(res.body.user.password).to.equal(undefined); // Password should be removed.
//           done();
//         })
//         .catch(done);
//     });
//   });
//
//   describe('# POST /api/users/changePassword/:userId', () => {
//     it('should change user password', (done) => {
//       request(app)
//         .post(`/api/users/changePassword/${user._id}`)
//         .set({ Authorization: `Bearer ${user.token}` })
//         .send(user)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.password).to.equal(user.password);
//           done();
//         })
//         .catch(done);
//     });
//   });
//
//   describe('# Error Handling', () => {
//     it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
//       request(app)
//         .get('/api/users/56z787zzz67fc')
//         .set({ Authorization: `Bearer ${user.token}` })
//         .expect(httpStatus.INTERNAL_SERVER_ERROR)
//         .then((res) => {
//           expect(res.body.error).to.contain('Cast to ObjectId failed');
//           expect(res.body.error).to.contain('56z787zzz67fc');
//           done();
//         })
//         .catch(done);
//     });
//   });
// });
